import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { loadEnvFile } from './config/env';
import { AppLoggerService } from './logger/app-logger.service';
import { LoggingInterceptor } from './logger/logging.interceptor';

async function bootstrap() {
  const envFile = loadEnvFile();
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  const logger = app.get(AppLoggerService);

  app.useLogger(logger);

  app.setGlobalPrefix('api');
  app.useGlobalInterceptors(app.get(LoggingInterceptor));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  const swaggerConfig = new DocumentBuilder()
    .setTitle('NestJS CLI4 API')
    .setDescription('Standard NestJS service API documentation')
    .setVersion('1.0.0')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('docs', app, swaggerDocument, {
    useGlobalPrefix: true,
    jsonDocumentUrl: 'docs-json',
  });

  await app.listen(port);

  logger.log(
    {
      baseUrl: `http://localhost:${port}/api`,
      envFile,
      swaggerUrl: `http://localhost:${port}/api/docs`,
    },
    'Bootstrap',
  );
}

bootstrap();
