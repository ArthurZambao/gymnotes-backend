import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { WorkoutLogController } from './workout-log.controller';
import { WorkoutLogService } from './workout-log.service';
import { WorkoutLogSchema } from 'src/modules/workout-log/schema/workout-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'WorkoutLog', schema: WorkoutLogSchema },
    ]),
  ],
  controllers: [WorkoutLogController],
  providers: [WorkoutLogService],
})
export class WorkoutLogModule { }