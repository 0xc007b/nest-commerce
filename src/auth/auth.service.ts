import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) { }

    async signIn(loginDto: LoginDto): Promise<any> {
        const user = await this.usersService.findOne({ email: loginDto.email });
        if (!user) throw new NotFoundException('User not found');

        const match = await bcrypt.compare(loginDto.password, user.passwordHash);
        if (!match) throw new UnauthorizedException('Invalid password');

        const payload = { sub: user.id, email: user.email, role: user.role };
        return { access_token: await this.jwtService.signAsync(payload) };
    }

    async signUp(registerDto: RegisterDto): Promise<any> {
        return this.usersService.create(registerDto)
    }
}
