import { Controller, Post, Body, Get, Param, Patch, UseGuards, Req, Delete } from '@nestjs/common';
import { WorkoutService } from './workout.service';
import { CreateWorkoutDto } from './DTO/workout-dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';

@Controller('workouts')
@UseGuards(JwtAuthGuard)
export class WorkoutController {
  constructor(private service: WorkoutService) { }

  @Post()
  create(@Req() req, @Body() body: CreateWorkoutDto) {
    return this.service.create({
      ...body,
      userId: req.user.sub,
    });
  }

  @Get('me')
  findMyWorkouts(@Req() req) {
    return this.service.findByUser(req.user.sub);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Req() req, @Body() body) {
    return this.service.update(id, req.user.sub, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.service.delete(id, req.user.sub);
  }
}