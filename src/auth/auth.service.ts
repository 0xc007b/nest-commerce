import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import * as crypto from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async signIn(loginDto: LoginDto): Promise<any> {
    const user = await this.usersService.findOne({ email: loginDto.email });
    if (!user) throw new NotFoundException('User not found');

    const match = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!match) throw new UnauthorizedException('Invalid password');

    // Update lastLoginAt timestamp
    await this.usersService.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
      isEmailVerified: user.isEmailVerified,
    };
  }

  async signUp(registerDto: RegisterDto): Promise<any> {
    const user = await this.usersService.create(registerDto);

    // Generate email verification token
    const token = crypto.randomBytes(32).toString('hex');

    // Set expiration (24 hours)
    const expires = new Date();
    expires.setHours(expires.getHours() + 24);

    // Create email verification record
    await this.prisma.emailVerification.create({
      data: {
        userId: user.id,
        token,
        expires,
      },
    });

    // todo: send verification email with the token

    return {
      message: 'Veuillez vérifier votre email pour valider votre compte.',
      userId: user.id,
    };
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.usersService.findOne({
      email: forgotPasswordDto.email,
    });
    if (!user) throw new NotFoundException('User not found');

    // Generate a reset token
    const token = crypto.randomBytes(32).toString('hex');

    // Store token with expiration (24 hours)
    const expires = new Date();
    expires.setHours(expires.getHours() + 24);

    // Delete any existing tokens for this user
    await this.prisma.passwordReset.deleteMany({
      where: { userId: user.id },
    });

    // Create new password reset record
    await this.prisma.passwordReset.create({
      data: {
        userId: user.id,
        token,
        expires,
      },
    });

    //todo: send an email with the reset link

    return {
      message:
        'Les instructions pour réinitialiser votre mot de passe ont été envoyées à votre adresse e-mail.',
    };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const { token, password, confirmPassword } = resetPasswordDto;

    // Validate token
    const passwordReset = await this.prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!passwordReset) throw new NotFoundException('Invalid token');

    // Check if token is expired
    if (new Date() > passwordReset.expires) {
      await this.prisma.passwordReset.delete({
        where: { id: passwordReset.id },
      });
      throw new BadRequestException('Token has expired');
    }

    // Check if token was already used
    if (passwordReset.usedAt) {
      throw new BadRequestException('Token has already been used');
    }

    // Validate password match
    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update the user's password
    await this.usersService.update({
      where: { id: passwordReset.userId },
      data: { passwordHash },
    });

    // Mark token as used
    await this.prisma.passwordReset.update({
      where: { id: passwordReset.id },
      data: { usedAt: new Date() },
    });

    return { message: 'Password has been reset successfully' };
  }

  async validateResetToken(token: string): Promise<{ valid: boolean }> {
    const passwordReset = await this.prisma.passwordReset.findUnique({
      where: { token },
    });

    if (!passwordReset) return { valid: false };

    // Check if token is expired
    if (new Date() > passwordReset.expires) {
      await this.prisma.passwordReset.delete({
        where: { id: passwordReset.id },
      });
      return { valid: false };
    }

    // Check if token was already used
    if (passwordReset.usedAt) {
      return { valid: false };
    }

    return { valid: true };
  }

  async verifyEmail(
    verifyEmailDto: VerifyEmailDto,
  ): Promise<{ message: string }> {
    const { token } = verifyEmailDto;

    const emailVerification = await this.prisma.emailVerification.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!emailVerification)
      throw new NotFoundException('Invalid verification token');

    // Check if token is expired
    if (new Date() > emailVerification.expires) {
      await this.prisma.emailVerification.delete({
        where: { id: emailVerification.id },
      });
      throw new BadRequestException('Verification token has expired');
    }

    // Mark user as verified
    await this.usersService.update({
      where: { id: emailVerification.userId },
      data: {
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    // Delete verification record
    await this.prisma.emailVerification.delete({
      where: { id: emailVerification.id },
    });

    return { message: 'Email verified successfully' };
  }

  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findOne({ email });
    if (!user) throw new NotFoundException('User not found');

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Delete any existing verification tokens
    await this.prisma.emailVerification.deleteMany({
      where: { userId: user.id },
    });

    // Generate new verification token
    const token = crypto.randomBytes(32).toString('hex');

    // Set expiration (24 hours)
    const expires = new Date();
    expires.setHours(expires.getHours() + 24);

    // Create new verification record
    await this.prisma.emailVerification.create({
      data: {
        userId: user.id,
        token,
        expires,
      },
    });

    // todo: send verification email with the token

    return {
      message: 'Un email de vérification a été envoyé à votre adresse email',
    };
  }
}
