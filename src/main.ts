import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import dns from 'node:dns';

dns.setDefaultResultOrder('ipv4first');
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = [
    ...(process.env.ALLOWED_ORIGINS?.split(',') ?? []),
    'http://localhost:3000',
    `http://localhost:${process.env.PORT ?? 3000}`,
  ];


  const config = new DocumentBuilder()
    .setTitle('Workout Notes API')
    .setDescription('Documentação da API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);


  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS bloqueado para origem: ${origin}`));
      }
    },
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.use(cookieParser());
  const port = process.env.PORT ?? 3000;
  await app.listen(process.env.PORT ?? 3000);

  console.log(`Swagger docs at http://localhost:${port}/docs`);
}
bootstrap();