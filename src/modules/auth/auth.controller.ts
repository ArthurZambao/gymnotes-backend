import { Body, Controller, Post, Get, Res, UseGuards, UnauthorizedException, Req } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from '@nestjs/passport';

const IS_PROD = process.env.NODE_ENV === 'production';

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: IS_PROD,
};

@Controller('auth')
export class AuthController {
  constructor(
    private service: AuthService,
    private jwtService: JwtService,
  ) { }

  @Post('login')
  @Throttle({ auth: { ttl: 60_000, limit: 10 } })
  async login(@Body() body, @Res({ passthrough: true }) res: Response) {
    const result = await this.service.login(body.email, body.password);

    res.cookie('token', result.accessToken, cookieOptions);
    res.cookie('refreshToken', result.refreshToken, cookieOptions);

    return result;
  }

  @Post('refresh')
  @Throttle({ auth: { ttl: 60_000, limit: 10 } })
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

  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('token', cookieOptions);
    response.clearCookie('refreshToken', cookieOptions);
    return { message: 'Logged out successfully' };
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() { }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req, @Res() res: Response) {
    const result = await this.service.loginWithGoogle(req.user);

    res.cookie('token', result.accessToken, cookieOptions);
    res.cookie('refreshToken', result.refreshToken, cookieOptions);

    // redireciona pro frontend já logado
    res.redirect(`${process.env.FRONTEND_URL}/home`);
  }
}