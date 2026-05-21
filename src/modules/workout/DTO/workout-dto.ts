import {
  IsString,
  IsArray,
  IsMongoId,
  IsNumber,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

class ExerciseDto {
  @IsMongoId()
  exerciseId!: string;

  @IsNumber()
  sets!: number;

  @IsArray()
  reps!: number[];

  @IsNumber()
  order!: number;
}

class WorkoutDayDto {
  @IsString()
  name!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExerciseDto)
  exercises!: ExerciseDto[];
}


export class CreateWorkoutDto {
  @IsString()
  name!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkoutDayDto)
  days!: WorkoutDayDto[];
}