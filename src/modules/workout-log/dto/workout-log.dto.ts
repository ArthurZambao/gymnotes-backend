import { ApiProperty } from '@nestjs/swagger';

export class ExerciseLogDto {
  @ApiProperty({ example: '664f1a2b3c4d5e6f7a8b9c0d' })
  exerciseId!: string;

  @ApiProperty({ example: 3 })
  sets!: number;

  @ApiProperty({ example: [10, 10, 8] })
  reps!: number[];

  @ApiProperty({ example: 80 })
  weight!: number;
}

export class SaveWorkoutLogDto {
  @ApiProperty({ example: '664f1a2b3c4d5e6f7a8b9c0d' })
  workoutId!: string;

  @ApiProperty({ example: 'Treino A' })
  dayName!: string;

  @ApiProperty({ example: '2026-05-27T00:00:00.000Z' })
  date!: string;

  @ApiProperty({ type: [ExerciseLogDto] })
  exercises!: ExerciseLogDto[];
}