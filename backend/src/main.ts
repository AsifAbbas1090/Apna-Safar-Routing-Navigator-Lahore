import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

/**
 * Bootstrap the NestJS application
 */
async function bootstrap() {
  // #region agent log
  const fs = require('fs'); const logPath = 'e:\\Asif\\Apna Safar\\.cursor\\debug.log'; try { fs.appendFileSync(logPath, JSON.stringify({location:'main.ts:9',message:'bootstrap started',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})+'\n'); } catch(e) {}
  // #endregion
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend
  // Allow both common frontend ports (3000 and 3002)
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'http://localhost:3002',
  ].filter(Boolean) as string[];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Allow all origins in development
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global exception filter for consistent error responses
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global validation pipe
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

  const port = process.env.PORT || 3001;
  // #region agent log
  const fs2 = require('fs'); const logPath2 = 'e:\\Asif\\Apna Safar\\.cursor\\debug.log'; try { fs2.appendFileSync(logPath2, JSON.stringify({location:'main.ts:51',message:'before app.listen',data:{port,envPort:process.env.PORT},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})+'\n'); } catch(e) {}
  // #endregion
  await app.listen(port);
  // #region agent log
  const fs3 = require('fs'); const logPath3 = 'e:\\Asif\\Apna Safar\\.cursor\\debug.log'; try { fs3.appendFileSync(logPath3, JSON.stringify({location:'main.ts:53',message:'app.listen succeeded',data:{port,listening:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})+'\n'); } catch(e) {}
  // #endregion
  console.log(`🚀 Apna Safar Backend running on http://localhost:${port}`);
  console.log(`📡 Health check: http://localhost:${port}/health`);
}
bootstrap().catch((error) => {
  // #region agent log
  const fs4 = require('fs'); const logPath4 = 'e:\\Asif\\Apna Safar\\.cursor\\debug.log'; try { fs4.appendFileSync(logPath4, JSON.stringify({location:'main.ts:56',message:'bootstrap error',data:{errorMessage:error?.message,errorStack:error?.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})+'\n'); } catch(e) {}
  // #endregion
  console.error('Failed to start server:', error);
  process.exit(1);
});
