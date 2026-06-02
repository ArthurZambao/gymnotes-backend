import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UserService } from '../user/user.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private mailService: MailService,
    private configService: ConfigService,
  ) { }

  async login(email: string, password: string) {
    const user = await this.userService.findByEmail(email);

    const dummyHash = '$2b$10$invalidsaltinvalidsaltinvalidsalt';
    const isMatch = user
      ? await bcrypt.compare(password, user.password)
      : await bcrypt.compare(password, dummyHash).then(() => false);

    if (!user || !isMatch) {
      throw new UnauthorizedException('Credenciais inválidas');
    }


    if (!user.emailVerified) {
      throw new UnauthorizedException('Email não verificado. Verifique sua caixa de entrada.');
    }

    return {
      ...(await this.generateTokens(user)),
      user: {
        email: user.email,
        name: user.name,
        weight: user.weight,
        height: user.height,
        avatar: user.avatar,
      },
    };
  }

  async sendVerificationEmail(userId: string, email: string, name: string) {
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.userService.setVerificationToken(userId, token, expires);

    const baseUrl = this.configService.getOrThrow<string>('BACKEND_URL');
    await this.mailService.sendVerificationEmail(email, name, token, baseUrl);
  }

  async verifyEmail(token: string) {
    const user = await this.userService.verifyEmail(token);

    if (!user) {
      throw new BadRequestException('Token inválido ou expirado');
    }

    return { message: 'Email verificado com sucesso!' };
  }

  async generateTokens(user: any) {
    const payload = { sub: user._id, email: user.email };

    return {
      accessToken: this.jwtService.sign(payload, { expiresIn: '15m' }),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  async loginWithGoogle(googleUser: { email: string; name: string; avatar: string }) {
    let user = await this.userService.findByEmail(googleUser.email);

    if (!user) {
      user = await this.userService.create({
        email: googleUser.email,
        name: googleUser.name,
        avatar: googleUser.avatar,
        password: crypto.randomUUID(),
        emailVerified: true,
      });
    }

    return this.generateTokens(user);
  }
}