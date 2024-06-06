import {
  CallHandler,
  ConsoleLogger,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Scope,
} from '@nestjs/common';
import { tap } from 'rxjs';

@Injectable({ scope: Scope.REQUEST })
export class LoggerInterceptor implements NestInterceptor {
  constructor(private readonly loggerService: ConsoleLogger) {}
  public intercept(context: ExecutionContext, next: CallHandler) {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();
    this.loggerService.log(`START_REQUEST: ${request.method} ${request.url}`, {
      headers: request.headers,
      body: request.body,
    });
    return next.handle().pipe(
      tap(() => {
        const response = httpContext.getResponse();
        this.loggerService.log(
          `SUCCESS_RESPONSE: ${request.method} ${request.url}`,
          {
            data: response.data,
          },
        );
      }),
    );
  }
}
