import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatasourcesModule } from './modules/datasources/datasources.module';
import { QuizModule } from './modules/features/quiz/quiz.module';
import { InternalModule } from './modules/features/internal/internal.module';
import { InterceptorModule } from './modules/commons/interceptors/interceptors.module';
import { HealthModule } from './modules/commons/health/health.module';
import { ShutdownModule } from './modules/commons/shutdown/shutdown.module';

@Module({
  imports: [
    ShutdownModule,
    DatasourcesModule,
    QuizModule,
    InternalModule,
    InterceptorModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
