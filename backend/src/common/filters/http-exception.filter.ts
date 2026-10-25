import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = (request.headers['x-request-id'] as string) || (request as any).requestId || 'req-unknown';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';
    let code = 'INTERNAL_SERVER_ERROR';
    let details: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const respObj = exceptionResponse as Record<string, any>;
        message = respObj.message || exception.message;
        code = respObj.error || (respObj.code as string) || this.statusToCode(status);

        if (Array.isArray(respObj.message)) {
          // class-validator array of error strings
          message = respObj.message.join(', ');
          details = respObj.message;
          code = 'VALIDATION_FAILED';
        }
      }
    } else if (exception instanceof Error) {
      const err = exception as any;
      console.error(`[UNHANDLED_EXCEPTION] [${requestId}]`, {
        message: err.message,
        stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
        code: err.code,
      });

      // PostgreSQL constraint error codes
      if (err.code === '23505') {
        status = HttpStatus.CONFLICT;
        code = 'RESOURCE_ALREADY_EXISTS';
        message = 'A conflicting resource with this key already exists.';
      } else if (err.code === '23503') {
        status = HttpStatus.BAD_REQUEST;
        code = 'FOREIGN_KEY_VIOLATION';
        message = 'Referenced entity does not exist.';
      } else {
        message = process.env.NODE_ENV === 'production'
          ? 'An unexpected error occurred while processing your request.'
          : err.message || 'Internal Server Error';
        code = err.code || 'SERVER_ERROR';
      }
    }

    response.status(status).json({
      success: false,
      error: {
        code,
        message,
        requestId,
        ...(details ? { details } : {}),
      },
    });
  }

  private statusToCode(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'BAD_REQUEST';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'CONFLICT';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'TOO_MANY_REQUESTS';
      default:
        return 'INTERNAL_SERVER_ERROR';
    }
  }
}
