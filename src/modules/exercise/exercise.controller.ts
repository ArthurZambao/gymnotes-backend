import { Controller, Post, Body, Get, Query } from "@nestjs/common";
import { ExerciseService } from "./exercise.service";
import { ApiTags, ApiOperation, ApiQuery } from "@nestjs/swagger";
import { CreateExerciseDto } from "./dto/create-exercise.dto";

@ApiTags('exercises')
@Controller('exercises')
export class ExerciseController {
  constructor(private service: ExerciseService) { }

  @Post()
  @ApiOperation({ summary: 'Cria um novo exercício' })
  @ApiQuery({ name: 'name', example: 'Bicep Curl' })
  create(@Body() body: CreateExerciseDto) {
    return this.service.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os exercícios' })
  @ApiQuery({ name: 'muscle', required: false, example: 'biceps' })
  findAll(@Query('muscle') muscle?: string | string[]) {
    if (muscle) {
      const musclesArray = Array.isArray(muscle) ? muscle : [muscle];

      return this.service.findByMuscle(musclesArray);
    }

    return this.service.findAll();
  }
}