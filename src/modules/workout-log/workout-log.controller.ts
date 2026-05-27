import { Controller, Post, Body, Get, Query, Req, UseGuards, Delete, Param } from "@nestjs/common";
import { WorkoutLogService } from "./workout-log.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth-guard";

@Controller('workout-logs')
@UseGuards(JwtAuthGuard)
export class WorkoutLogController {
  constructor(private service: WorkoutLogService) { }

  @Post()
  createOrUpdate(@Body() body, @Req() req) {
    const userId = req.user.sub;
    return this.service.createOrUpdate({ ...body, userId });
  }

  @Get()
  findByMonth(
    @Query('month') month: string,
    @Req() req
  ) {
    const userId = req.user.sub;
    return this.service.findByMonth(userId, month);
  }

  @Delete(':id')
  deleteById(
    @Param('id') id: string,
    @Req() req
  ) {
    const userId = req.user.sub;
    return this.service.deleteById(id, userId);
  }
}