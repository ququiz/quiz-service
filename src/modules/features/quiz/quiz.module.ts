import { Module } from '@nestjs/common';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { DatasourcesModule } from 'src/modules/datasources/datasources.module';
import { AuthModule } from 'src/modules/commons/auth/auth.module';
import { ConfigService } from '@nestjs/config';
import { CronModule } from 'src/modules/commons/cron/cron.module';
import { InternalModule } from '../internal/internal.module';

@Module({
  imports: [DatasourcesModule, AuthModule, CronModule, InternalModule],
  controllers: [QuizController],
  providers: [QuizService, ConfigService],
})
export class QuizModule {}
