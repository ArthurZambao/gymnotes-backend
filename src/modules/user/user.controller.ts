import { Body, Controller, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';
import { CreateUserDto, UpdateUserDto } from './dto/create-user-dto';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';



@Controller('users')
@ApiTags('users')
@ApiBearerAuth()
export class UserController {
  constructor(private service: UserService) { }

  @ApiOperation({ summary: 'Cria um novo usuário' })
  @Post()
  @Throttle({ auth: { ttl: 60_000, limit: 10 } })
  create(@Body() body: CreateUserDto) {
    return this.service.create(body);
  }

  @ApiOperation({ summary: 'Busca os dados do usuário autenticado' })
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req) {
    return this.service.findById(req.user.sub);
  }

  @ApiOperation({ summary: 'Atualiza os dados do usuário autenticado' })
  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateMe(@Req() req, @Body() body: UpdateUserDto) {
    return this.service.update(req.user.sub, body);
  }
}