import { ApiProperty } from '@nestjs/swagger';

export class MuscleGroupDto {
  @ApiProperty({ example: 'biceps' })
  name!: string;

  @ApiProperty({ enum: ['primary', 'secondary', 'tertiary'], example: 'primary' })
  type!: 'primary' | 'secondary' | 'tertiary';
}

export class CreateExerciseDto {
  @ApiProperty({ example: 'Bicep Curl' })
  name!: string;

  @ApiProperty({ enum: ['kg', 'placas'], default: 'kg' })
  weightUnit!: 'kg' | 'placas';

  @ApiProperty({ type: [MuscleGroupDto] })
  muscleGroups!: MuscleGroupDto[];
}