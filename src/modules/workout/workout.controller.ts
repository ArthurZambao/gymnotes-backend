import { Controller, Post, Body, Get, Param, Patch, UseGuards, Req, Delete } from '@nestjs/common';
import { WorkoutService } from './workout.service';
import { CreateWorkoutDto, UpdateWorkoutDto } from './dto/workout-dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';


@ApiTags('workouts')
@ApiBearerAuth()
@Controller('workouts')
@UseGuards(JwtAuthGuard)
export class WorkoutController {
  constructor(private service: WorkoutService) { }

  @ApiOperation({ summary: 'Cria um novo treino' })

  @Post()
  create(@Req() req, @Body() body: CreateWorkoutDto) {
    return this.service.create({
      ...body,
      userId: req.user.sub,
    });
  }

  @ApiOperation({ summary: 'Busca os treinos do usuário autenticado' })
  @Get('me')
  findMyWorkouts(@Req() req) {
    return this.service.findByUser(req.user.sub);
  }

  @ApiOperation({ summary: 'Atualiza um treino pelo ID' })

  @Patch(':id')
  update(@Param('id') id: string, @Req() req, @Body() body: UpdateWorkoutDto) {
    return this.service.update(id, req.user.sub, body);
  }

  @ApiOperation({ summary: 'Exclui um treino pelo ID' })
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.service.delete(id, req.user.sub);
  }
}