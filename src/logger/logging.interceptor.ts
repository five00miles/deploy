import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AppLoggerService } from './app-logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const startedAt = Date.now();
    const http = context.switchToHttp();
    const request = http.getRequest<{
      method: string;
      originalUrl?: string;
      url: string;
      ip?: string;
    }>();
    const response = http.getResponse<{ statusCode: number }>();

    return next.handle().pipe(
      tap(() => {
        this.logger.logHttpRequest({
          method: request.method,
          path: request.originalUrl ?? request.url,
          ip: request.ip ?? 'unknown',
          statusCode: response.statusCode,
          durationMs: Date.now() - startedAt,
        });
      }),
      catchError((error: unknown) => {
        this.logger.logHttpError('HTTP request failed', {
          method: request.method,
          path: request.originalUrl ?? request.url,
          ip: request.ip ?? 'unknown',
          statusCode: response.statusCode,
          durationMs: Date.now() - startedAt,
          error:
            error instanceof Error
              ? {
                  name: error.name,
                  message: error.message,
                }
              : String(error),
        });

        return throwError(() => error);
      }),
    );
  }
}
