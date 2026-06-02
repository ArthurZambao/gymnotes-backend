import { Body, Controller, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';
import { CreateUserDto, UpdateUserDto } from './dto/create-user-dto';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@Controller('users')
@ApiTags('users')
@ApiBearerAuth()
export class UserController {
  constructor(
    private service: UserService,
    private authService: AuthService,
  ) { }

  @ApiOperation({ summary: 'Cria um novo usuário' })
  @Post()
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  async create(@Body() body: CreateUserDto) {
    const user = await this.service.create(body);

    await this.authService.sendVerificationEmail(user._id, user.email, user.name);

    return { message: 'Usuário criado! Verifique seu email para ativar a conta.' };
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