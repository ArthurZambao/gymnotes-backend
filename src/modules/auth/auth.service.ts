import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) { }

  async login(email: string, password: string) {
    const user = await this.userService.findByEmail(email);

    // Compara mesmo se user não existir para evitar timing attack
    const dummyHash = '$2b$10$invalidsaltinvalidsaltinvalidsalt';
    const isMatch = user
      ? await bcrypt.compare(password, user.password)
      : await bcrypt.compare(password, dummyHash).then(() => false);

    if (!user || !isMatch) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: {
        email: user.email,
        name: user.name,
        weight: user.weight,
        height: user.height,
        avatar: user.avatar,
      },
    };
  }

  async generateTokens(user: any) {
    const payload = {
      sub: user._id,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  async loginWithGoogle(googleUser: { email: string; name: string; avatar: string }) {
    let user = await this.userService.findByEmail(googleUser.email);

    if (!user) {
      // cria o usuário automaticamente se for o primeiro login
      user = await this.userService.create({
        email: googleUser.email,
        name: googleUser.name,
        avatar: googleUser.avatar,
        password: crypto.randomUUID(), // senha aleatória, nunca vai usar
      });
    }

    return this.generateTokens(user);
  }

}