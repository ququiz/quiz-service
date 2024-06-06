import { ClassProvider, ConsoleLogger, Module, Type } from '@nestjs/common';
import { LoggerInterceptor } from './logger.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  providers: [
    InterceptorModule.createProvider(LoggerInterceptor),
    LoggerInterceptor,
    ConsoleLogger,
  ],
})
export class InterceptorModule {
  public static createProvider<T>(useClass: Type<T>): ClassProvider<T> {
    return {
      provide: APP_INTERCEPTOR,
      useClass: useClass,
    };
  }
}
