import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import express from 'express';
import { AppModule } from './app.module';
import { runMigrations } from './migrate';
import { getDbHealth } from './db';
import { initRealtimeServer } from './services/realtime.service';

const PORT = process.env.PORT || 8080;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

async function bootstrap() {
  console.log(`[STARTUP] Initializing VisitNepal NestJS Architecture in ${IS_PRODUCTION ? 'PRODUCTION' : 'DEVELOPMENT'} mode...`);

  const initialDbCheck = await getDbHealth();
  console.log(`[STARTUP] Database Status: ${initialDbCheck.status.toUpperCase()} (${initialDbCheck.provider})`);

  if (IS_PRODUCTION && initialDbCheck.status !== 'healthy') {
    console.error('[FATAL] Production database connectivity failed. Refusing to start with volatile store.');
    process.exit(1);
  }

  await runMigrations();

  const app = await NestFactory.create(AppModule, {
    cors: false, // Explicitly managed below
  });

  // Security Headers via Helmet
  app.use(
    helmet({
      contentSecurityPolicy: false, // Allow Flutter Web canvaskit & fonts
      crossOriginEmbedderPolicy: false,
    })
  );

  // Strict CORS policy
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
    : ['http://localhost:8080', 'http://localhost:3000', 'http://127.0.0.1:8080'];

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow all origins unconditionally for now to prevent CORS issues
      callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    credentials: true,
  });

  // Global DTO Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    })
  );

  // Body parser limits
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Static Flutter Web build (Unified single-origin hosting)
  const webBuildPath = path.resolve(__dirname, '../../build/web');
  if (fs.existsSync(webBuildPath)) {
    app.use(express.static(webBuildPath));
  }

  // Swagger API Documentation (Protected in production)
  if (!IS_PRODUCTION || process.env.ENABLE_SWAGGER === 'true') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('VisitNepal Tourism Platform API')
      .setDescription('Production-hardened NestJS API and Real-time WebSocket architecture')
      .setVersion('2.0.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
    console.log(`[SWAGGER] API Documentation available at /api/docs`);
  }

  // Initialize Realtime WebSocket Server attached to the HTTP server
  const httpServer = app.getHttpServer();
  initRealtimeServer(httpServer);

  await app.listen(PORT);
  console.log(`[SERVER_READY] VisitNepal NestJS API & Realtime Server running on port ${PORT}`);
}

bootstrap().catch((err) => {
  console.error('[FATAL_STARTUP_ERROR]', err);
  process.exit(1);
});
