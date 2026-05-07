import { Controller, Post, Body, Get, Param, Patch, UseGuards, Req, Delete } from "@nestjs/common";
import { WorkoutService } from "./workout.service";
import { CreateWorkoutDto } from "./DTO/workout-dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth-guard";


@Controller('workouts')
export class WorkoutController {
  constructor(private service: WorkoutService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req, @Body() body: CreateWorkoutDto) {
    return this.service.create({
      ...body,
      userId: req.user.sub,
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  findMyWorkouts(@Req() req) {
    return this.service.findByUser(req.user.sub);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() body) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.service.delete(id);
  }

}