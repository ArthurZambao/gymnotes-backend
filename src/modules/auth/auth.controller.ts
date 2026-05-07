import { Body, Controller, Post, Res, Req, UnauthorizedException } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private service: AuthService,
    private jwtService: JwtService,
  ) { }

  @Post("login")
  async login(@Body() body, @Res({ passthrough: true }) res: Response) {
    const result = await this.service.login(body.email, body.password);

    res.cookie("token", result.accessToken, {
      httpOnly: true,
      sameSite: "lax",
    });

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      sameSite: "lax",
    });

    return result;
  }

  @Post("refresh")
  async refresh(@Req() req, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException("Refresh token não fornecido");
    }

    try {
      const decoded = this.jwtService.verify(refreshToken);

      const newAccessToken = this.jwtService.sign(
        { sub: decoded.sub, email: decoded.email },
        { expiresIn: "15m" }
      );

      res.cookie("token", newAccessToken, {
        httpOnly: true,
        sameSite: "lax",
      });

      return { accessToken: newAccessToken };
    } catch {
      throw new UnauthorizedException("Refresh token inválido ou expirado");
    }
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('token');
    response.clearCookie('refreshToken');
    return { message: 'Logged out successfully' };
  }
}