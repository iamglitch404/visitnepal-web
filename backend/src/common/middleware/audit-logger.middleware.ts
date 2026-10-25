import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuditLoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const safeUrl = req.originalUrl.split('?')[0];
    const requestId = (req as any).requestId || 'req-init';

    res.on('finish', () => {
      const elapsed = Date.now() - start;
      if (req.method !== 'GET' || safeUrl.includes('/health')) {
        console.log(
          `[API_AUDIT] [${requestId}] ${req.method} ${safeUrl} -> ${res.statusCode} (${elapsed}ms) - IP: ${req.ip}`
        );
      }
    });

    next();
  }
}
