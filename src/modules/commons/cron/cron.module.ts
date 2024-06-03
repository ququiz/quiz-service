import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CronService } from './cron.service';

@Module({
  imports: [ConfigModule, HttpModule],
  providers: [CronService],
  exports: [CronService],
})
export class CronModule {}
