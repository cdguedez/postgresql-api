import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('bootstrap');
  app.setGlobalPrefix('api');

  const configSwagger = new DocumentBuilder()
    .setBasePath('api')
    .setTitle('API TESLA')
    .setDescription('Documentación de API tesla')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, configSwagger);
  SwaggerModule.setup('docs-api', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(process.env.PORT_API);
  logger.log(`Application is running on PORT: ${process.env.PORT_API}`);
}
bootstrap();
