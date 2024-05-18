import { Module } from '@nestjs/common';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { DatasourcesModule } from 'src/modules/datasources/datasources.module';
import { AuthModule } from 'src/modules/commons/auth/auth.module';

@Module({
  imports: [DatasourcesModule, AuthModule],
  controllers: [QuizController],
  providers: [QuizService],
})
export class QuizModule {}
