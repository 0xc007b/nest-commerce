import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.authService.signIn(loginDto);
    }

    @Post('register')
    async register(@Body() registerDto: CreateUserDto) {
        const hashedPassword = bcrypt.hashSync(registerDto.password, 10);

        const data: RegisterDto = {
            firstName: registerDto.firstName,
            lastName: registerDto.lastName,
            email: registerDto.email,
            passwordHash: hashedPassword,
        };
        
        return this.authService.signUp(data);
    }
}
