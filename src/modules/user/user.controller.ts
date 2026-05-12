import { Body, Controller, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';

@Controller('users')
export class UserController {
  constructor(private service: UserService) { }

  @Post()
  create(@Body() body) {
    return this.service.create(body);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

@Get('me')
@UseGuards(JwtAuthGuard)
async getMe(@Req() req) {
  return this.service.findById(req.user.sub); // busca tudo do banco
}

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateMe(@Req() req, @Body() body) {
    return this.service.update(req.user.sub, body);
  }
}