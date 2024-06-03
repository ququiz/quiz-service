import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatasourcesModule } from './modules/datasources/datasources.module';
import { QuizModule } from './modules/features/quiz/quiz.module';
import { InternalModule } from './modules/features/internal/internal.module';

@Module({
  imports: [DatasourcesModule, QuizModule, InternalModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
