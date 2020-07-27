import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { AppModule } from './modules/app.module';
import swaggerInit from './modules/swagger';
import constants from './common/constants';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.set('trust proxy', 1);
  app.use(compression());
  app.use(helmet());
  app.use(rateLimit(constants.RATELIMIT));

  swaggerInit(app);
  await app.listen(process.env.APP_PORT, process.env.APP_HOST);
}
bootstrap();
