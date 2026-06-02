import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExerciseModule } from './modules/exercise/exercise.module';
import { WorkoutModule } from './modules/workout/workout.module';
import { WorkoutLogModule } from './modules/workout-log/workout-log.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          name: 'default',
          ttl: parseInt(config.get<string>('THROTTLE_TTL', '60000'), 10),
          limit: parseInt(config.get<string>('THROTTLE_LIMIT', '200'), 10),
        },
      ],
    }),
    ExerciseModule,
    WorkoutModule,
    WorkoutLogModule,
    UserModule,
    AuthModule,
  ],
  controllers: [],
  providers: [
    ...(process.env.NODE_ENV === 'test'
      ? []
      : [
          {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
          },
        ]),
  ],
})
export class AppModule { }