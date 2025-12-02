import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global prefix
  app.setGlobalPrefix('api');

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS
  const corsOrigins = configService.get<string>('APP_CORS_ORIGINS')?.split(',') || ['http://localhost:4200'];
  app.enableCors({
    origin: corsOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('DeepSeek OCR API')
    .setDescription('API for OCR processing using DeepSeek model through Ollama')
    .setVersion('1.0')
    .addTag('ocr', 'OCR processing endpoints')
    .addTag('health', 'Health check endpoints')
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'api-key')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get<number>('APP_PORT') || 3000;
  const host = configService.get<string>('APP_HOST') || '0.0.0.0';

  await app.listen(port, host);
  console.log(`🚀 Application is running on: http://${host}:${port}`);
  console.log(`📚 Swagger documentation: http://${host}:${port}/api/docs`);
}

bootstrap();