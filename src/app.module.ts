import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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
    ThrottlerModule.forRoot([
      {
        // Limite geral: 100 req por 60 segundos por IP
        name: 'global',
        ttl: 60_000,
        limit: 200,
      },
      {
        // Limite estrito para auth: 10 tentativas por minuto
        name: 'auth',
        ttl: 60_000,
        limit: 10,
      },
    ]),
    ExerciseModule,
    WorkoutModule,
    WorkoutLogModule,
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      // Aplica o rate limit globalmente em todos os endpoints
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }