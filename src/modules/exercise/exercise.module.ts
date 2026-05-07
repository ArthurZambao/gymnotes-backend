import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ExerciseController } from './exercise.controller';
import { ExerciseService } from './exercise.service';
import { ExerciseSchema } from 'src/modules/exercise/schema/exercise.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Exercise', schema: ExerciseSchema },
    ]),
  ],
  controllers: [ExerciseController],
  providers: [ExerciseService],
})
export class ExerciseModule { }