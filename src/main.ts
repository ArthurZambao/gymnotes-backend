import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:3001'];

  app.enableCors({
    origin: (origin, callback) => {
      // Permite requests sem origin (ex: mobile apps, curl) em dev
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS bloqueado para origem: ${origin}`));
      }
    },
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,       // remove campos não declarados no DTO
    forbidNonWhitelisted: true, // lança erro se vier campo extra
    transform: true,
  }));

  app.use(cookieParser());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();