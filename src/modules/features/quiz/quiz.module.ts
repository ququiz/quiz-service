import { Module } from '@nestjs/common';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { DatasourcesModule } from 'src/modules/datasources/datasources.module';
import { AuthModule } from 'src/modules/commons/auth/auth.module';
import { CronService } from '../cron/cron.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [DatasourcesModule, AuthModule, HttpModule],
  controllers: [QuizController],
  providers: [QuizService, CronService, ConfigService],
})
export class QuizModule {}
