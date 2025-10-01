import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@pay-wallet/common';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'v1';
  app.setGlobalPrefix(globalPrefix);
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());
  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Pay Wallet API')
    .setDescription('The Pay Wallet API')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-Auth' // This name here is important for references
    )
    .addServer('http://localhost:3000', 'Local')
    // .addServer('https://m3d-h6n-api.dev101.cloud/api/', 'Devnet')
    .addServer('https://whp-api.dessistant.xyz/', 'Dev')
    .build();
  // if (process.env.ENABLE_SWAGGER == 'true') {
  //   const document = SwaggerModule.createDocument(app, config);
  //   SwaggerModule.setup('docs', app, document);
  // }
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // setup cors
  app.enableCors({
    origin: [
      /^http:\/\/localhost(:[0-9]+)?$/,
      'http://localhost:8080',
      'https://whp-api.dessistant.xyz/',
      'http://whp-api.dessistant.xyz/',
      /^https?:\/\/([a-z0-9]+\.)?dessistant\.xyz$/,
      'http://dessisstant-fe.onrender.com',
      'https://dessisstant-fe.onrender.com',
      /^https?:\/\/([a-z0-9]+\.)?dessisstant-fe\.onrender\.com$/,
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });

  app.use(helmet());
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'your-session-secret',
      resave: false,
      saveUninitialized: false,
      // cookie: {
      //   httpOnly: true,
      //   maxAge: 24 * 60 * 60 * 1000, // 1 day
      //   secure: process.env.NODE_ENV === 'production',
      //   sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      //   path: '/',
      // },
    })
  );
  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
  Logger.log(
    `📝 Swagger documentation is running on: http://localhost:${port}/docs`
  );
}

bootstrap();
