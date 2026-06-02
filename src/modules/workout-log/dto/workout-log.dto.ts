import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class ExerciseLogDto {
  @ApiProperty({ example: '664f1a2b3c4d5e6f7a8b9c0d' })
  @IsString()
  exerciseId!: string;

  @ApiProperty({ example: 3 })
  @IsNumber()
  sets!: number;

  @ApiProperty({ example: [10, 10, 8] })
  @IsArray()
  @IsNumber({}, { each: true })
  reps!: number[];

  @ApiProperty({ example: 80 })
  @IsNumber()
  weight!: number;
}

export class SaveWorkoutLogDto {
  @ApiProperty({ example: '664f1a2b3c4d5e6f7a8b9c0d' })
  @IsString()
  workoutId!: string;

  @ApiProperty({ example: 'Treino A' })
  @IsString()
  dayName!: string;

  @ApiProperty({ example: '2026-05-27T00:00:00.000Z' })
  @IsDateString()
  date!: string;

  @ApiProperty({ type: [ExerciseLogDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExerciseLogDto)
  exercises!: ExerciseLogDto[];
}