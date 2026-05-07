import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) { }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const token = request.cookies?.token;
    console.log('Token recebido:', token);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const decoded = this.jwtService.verify(token);
      request.user = decoded;
      return true;
    } catch (err) {
      console.error('Erro na validação do JWT:', err instanceof Error ? err.message : 'Unknown error');
      throw new UnauthorizedException();
    }
  }
}