import { Body, Controller, Post, Get, Res, UseGuards, UnauthorizedException, Req, Query } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { UserService } from '../user/user.service';

const IS_PROD = process.env.NODE_ENV === 'production';

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: IS_PROD,
};

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private service: AuthService,
    private jwtService: JwtService,
    private userService: UserService,
  ) { }

  @ApiOperation({ summary: 'Realiza login do usuário' })
  @Post('login')
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.service.login(body.email, body.password);

    res.cookie('token', result.accessToken, cookieOptions);
    res.cookie('refreshToken', result.refreshToken, cookieOptions);

    return result;
  }

  @ApiOperation({ summary: 'Renova o token de acesso usando o refresh token' })
  @Post('refresh')
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  async refresh(@Req() req, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token não fornecido');
    }

    try {
      const decoded = this.jwtService.verify(refreshToken);

      const newAccessToken = this.jwtService.sign(
        { sub: decoded.sub, email: decoded.email },
        { expiresIn: '15m' },
      );

      res.cookie('token', newAccessToken, cookieOptions);

      return { accessToken: newAccessToken };
    } catch {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }
  }

  @ApiOperation({ summary: 'Realiza logout do usuário' })
  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('token', cookieOptions);
    response.clearCookie('refreshToken', cookieOptions);
    return { message: 'Logged out successfully' };
  }

  @ApiOperation({ summary: 'Inicia o login com Google' })
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() { }

  @ApiOperation({ summary: 'Completa o login com Google' })
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req, @Res() res: Response) {
    const result = await this.service.loginWithGoogle(req.user);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    const redirectUrl = new URL('/auth/google/callback', frontendUrl);
    redirectUrl.searchParams.set('token', result.accessToken);
    redirectUrl.searchParams.set('refreshToken', result.refreshToken);

    res.redirect(redirectUrl.toString());
  }

  @ApiOperation({ summary: 'Verifica o email pelo token recebido' })
  @Get('verify-email')
  async verifyEmail(@Query('token') token: string, @Res() res: Response) {
    try {
      await this.service.verifyEmail(token);
      return res.redirect(`${process.env.FRONTEND_URL}/login?verified=true`);
    } catch {
      return res.redirect(`${process.env.FRONTEND_URL}/login?verified=false`);
    }
  }

  @ApiOperation({ summary: 'Reenvia o email de verificação' })
  @Post('resend-verification')
  @Throttle({ default: { ttl: 60_000, limit: 3 } })
  async resendVerification(@Body('email') email: string) {
    const user = await this.userService.findByEmail(email);

    if (!user || user.emailVerified) {
      return { message: 'Se o email existir, um novo link foi enviado.' };
    }

    await this.service.sendVerificationEmail(user._id, user.email, user.name);
    return { message: 'Se o email existir, um novo link foi enviado.' };
  }
}