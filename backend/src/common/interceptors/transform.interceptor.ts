import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';

const SENSITIVE_KEYS = new Set([
  'password_hash',
  'password',
  'jwt_secret',
  'secret',
  'private_key',
  'stripe_secret',
  'paypal_secret',
  'secret_key',
  'reset_token',
  'verification_token',
]);

function sanitizeData(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeData(item));
  }

  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      continue; // Exclude sensitive key completely from response
    }
    cleaned[key] = sanitizeData(value);
  }
  return cleaned;
}

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const requestId = (req.headers['x-request-id'] as string) || (req as any).requestId || 'req-unknown';

    return next.handle().pipe(
      map((response) => {
        // If already formatted with success and data, sanitize data and inject requestId
        if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
          return {
            ...response,
            data: sanitizeData(response.data),
            requestId: response.requestId || requestId,
          };
        }

        // Standard controller return value wrapping
        return {
          success: true,
          data: sanitizeData(response),
          requestId,
        };
      })
    );
  }
}
