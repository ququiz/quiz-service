import { Module } from '@nestjs/common';
import { ProducerService } from './producer.service';
import { ConsumerService } from './consumer.service';
import { ConfigService } from '@nestjs/config';
import { DatasourcesModule } from 'src/modules/datasources/datasources.module';

@Module({
  imports: [DatasourcesModule],
  providers: [ConfigService, ProducerService, ConsumerService],
  exports: [ProducerService],
})
export class QueueModule {}
