import { Body, Controller, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';
import { CreateUserDto } from './dto/create-user-dto';
import { Throttle } from '@nestjs/throttler';

@Controller('users')
export class UserController {
  constructor(private service: UserService) { }

  @Post()
  @Throttle({ auth: { ttl: 60_000, limit: 10 } }) // Limita criação de contas
  create(@Body() body: CreateUserDto) {
    return this.service.create(body);
  }


  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req) {
    return this.service.findById(req.user.sub);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateMe(@Req() req, @Body() body) {
    return this.service.update(req.user.sub, body);
  }
}