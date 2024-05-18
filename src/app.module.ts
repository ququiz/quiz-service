import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatasourcesModule } from './modules/datasources/datasources.module';
import { QuizModule } from './modules/features/quiz/quiz.module';

@Module({
  imports: [DatasourcesModule, QuizModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
