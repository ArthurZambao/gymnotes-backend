import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ExerciseModule } from './modules/exercise/exercise.module';
import { WorkoutModule } from './modules/workout/workout.module';
import { WorkoutLogModule } from './modules/workout-log/workout-log.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forRoot("mongodb://arthurzambaoo:r2AiDka9qIYhHVfe@ac-kzyumq6-shard-00-00.l8jm2ey.mongodb.net:27017,ac-kzyumq6-shard-00-01.l8jm2ey.mongodb.net:27017,ac-kzyumq6-shard-00-02.l8jm2ey.mongodb.net:27017/?ssl=true&replicaSet=atlas-sb2y8d-shard-0&authSource=admin&appName=GymNotesDB"),
    ExerciseModule,
    WorkoutModule,
    WorkoutLogModule,
    UserModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
