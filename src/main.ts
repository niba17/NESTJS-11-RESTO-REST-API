import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT || 3000);
  console.log(
    `Aplikasi resto-rest-api sudah siap di port ${process.env.PORT || 3000}, bos!`,
  );
}
bootstrap().catch((err) => {
  console.error('Ada error saat startup, bos:', err);
});
