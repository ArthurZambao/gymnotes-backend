import { Controller, Post, Body, Get, Query } from "@nestjs/common";
import { ExerciseService } from "./exercise.service";

@Controller('exercises')
export class ExerciseController {
  constructor(private service: ExerciseService) { }

  @Post()
  create(@Body() body) {
    return this.service.create(body);
  }

  @Get()
  findAll(@Query('muscle') muscle?: string | string[]) {
    if (muscle) {
      const musclesArray = Array.isArray(muscle) ? muscle : [muscle];

      return this.service.findByMuscle(musclesArray);
    }

    return this.service.findAll();
  }
}