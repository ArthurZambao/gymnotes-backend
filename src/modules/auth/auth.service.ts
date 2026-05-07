import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  findAll() {
    throw new Error('Method not implemented.');
  }

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) { }

  async login(email: string, password: string) {
    const user = await this.userService.findByEmail(email);

    if (!user) throw new UnauthorizedException("Credenciais inválidas");

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) throw new UnauthorizedException("Credenciais inválidas");

    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: {
        email: user.email,
        name: user.name,
        weight: user.weight,
        height: user.height,
      },
    };
  }

  async generateTokens(user: any) {
    const payload = {
      sub: user._id,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: "15m",
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: "7d",
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}