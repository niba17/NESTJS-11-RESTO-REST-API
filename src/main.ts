import { NestFactory, Reflector } from '@nestjs/core';
import {
  BadRequestException,
  ClassSerializerInterceptor,
  ValidationPipe,
} from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'; // Tambah ini
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalFilters(new HttpExceptionFilter());

  // 1. AKTIFKAN SERIALIZER (Agar @Exclude() di Entity jalan)
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // 2. AKSES STATIC ASSETS (Untuk gambar menu)
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // 3. VALIDASI GLOBAL DENGAN CUSTOM RESPONSE
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      // --- LOGIKA BARU DI SINI, BOS ---
      exceptionFactory: (errors) => {
        const formattedErrors = errors.map((err) => ({
          field: err.property,
          errors: Object.values(err.constraints || {}),
        }));

        return new BadRequestException({
          statusCode: 400,
          message: 'Validation failed',
          error: 'Bad Request',
          errors: formattedErrors,
        });
      },
    }),
  );

  // 4. KONFIGURASI SWAGGER (Si "Buku Menu" API)
  const config = new DocumentBuilder()
    .setTitle('Resto API - Management System')
    .setDescription('Resto API Documentation')
    .setVersion('1.0')
    .addBearerAuth() // Penting agar Bos bisa testing rute yang pakai JWT
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document); // Akses di localhost:3000/docs

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`\n✅ resto-rest-api app listening on port ${port}`);
  console.log(`📖 Swagger documentation: http://localhost:3000/docs\n`);
}

bootstrap().catch((err) => {
  console.error('Error during startup:', err);
});
