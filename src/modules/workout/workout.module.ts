import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { WorkoutController } from './workout.controller';
import { WorkoutService } from './workout.service';
import { WorkoutSchema } from 'src/modules/workout/schema/workout.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Workout', schema: WorkoutSchema },
    ]),
  ],
  controllers: [WorkoutController],
  providers: [WorkoutService],
})
export class WorkoutModule { }