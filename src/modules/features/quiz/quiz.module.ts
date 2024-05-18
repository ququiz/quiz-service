import { Module } from '@nestjs/common';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { DatasourcesModule } from 'src/modules/datasources/datasources.module';

@Module({
  imports: [DatasourcesModule],
  controllers: [QuizController],
  providers: [QuizService],
})
export class QuizModule {}
