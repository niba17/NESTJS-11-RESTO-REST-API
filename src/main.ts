import { NestFactory, Reflector } from '@nestjs/core'; // 1. Import Reflector
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common'; // 2. Import Interceptor
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api');

  // 3. AKTIFKAN SERIALIZER SECARA GLOBAL
  // Ini kuncinya agar @Exclude() di Entity otomatis jalan, Bos!
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT || 3000);
  console.log(
    `Aplikasi resto-rest-api siap di port ${process.env.PORT || 3000}, bos!`,
  );
}
bootstrap().catch((err) => {
  console.error('Ada error saat startup, bos:', err);
});
