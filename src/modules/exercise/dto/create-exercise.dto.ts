import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsString, ValidateNested } from 'class-validator';

export class MuscleGroupDto {
  @ApiProperty({ example: 'biceps' })
  @IsString()
  name!: string;

  @ApiProperty({ enum: ['primary', 'secondary', 'tertiary'], example: 'primary' })
  @IsEnum(['primary', 'secondary', 'tertiary'])
  type!: 'primary' | 'secondary' | 'tertiary';
}

export class CreateExerciseDto {
  @ApiProperty({ example: 'Bicep Curl' })
  @IsString()
  name!: string;

  @ApiProperty({ enum: ['kg', 'placas'], default: 'kg' })
  @IsEnum(['kg', 'placas'])
  weightUnit!: 'kg' | 'placas';

  @ApiProperty({ type: [MuscleGroupDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MuscleGroupDto)
  muscleGroups!: MuscleGroupDto[];
}