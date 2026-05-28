import { Controller, Post, Body, Get, Query, Req, UseGuards, Delete, Param } from "@nestjs/common";
import { WorkoutLogService } from "./workout-log.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth-guard";
import { SkipThrottle, Throttle } from "@nestjs/throttler";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { SaveWorkoutLogDto } from "./dto/workout-log.dto";

@ApiTags('workout-logs')
@ApiBearerAuth()
@Controller('workout-logs')
@UseGuards(JwtAuthGuard)
export class WorkoutLogController {
  constructor(private service: WorkoutLogService) { }

  @ApiOperation({ summary: 'Cria ou atualiza um log de treino' })
  @Throttle({ default: { ttl: 60_000, limit: 20 } })
  @Post()
  createOrUpdate(@Body() body: SaveWorkoutLogDto, @Req() req) {
    const userId = req.user.sub;
    return this.service.createOrUpdate({ ...body, userId });
  }


  @ApiOperation({ summary: 'Busca logs de um mês específico' })
  @ApiQuery({ name: 'month', example: '2026-05' })
  @SkipThrottle()
  @Get()
  findByMonth(
    @Query('month') month: string,
    @Req() req
  ) {
    const userId = req.user.sub;
    return this.service.findByMonth(userId, month);
  }

  @ApiOperation({ summary: 'Exclui um log de treino pelo ID' })
  @Throttle({ default: { ttl: 60_000, limit: 20 } })
  @Delete(':id')
  deleteById(
    @Param('id') id: string,
    @Req() req
  ) {
    const userId = req.user.sub;
    return this.service.deleteById(id, userId);
  }
}