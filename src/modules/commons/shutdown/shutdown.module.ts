import { Module } from '@nestjs/common';
import { DatasourcesModule } from 'src/modules/datasources/datasources.module';
import { QueueModule } from '../queue/queue.module';
import { ShutdownService } from './shutdown.service';

@Module({
  imports: [DatasourcesModule, QueueModule],
  providers: [ShutdownService],
})
export class ShutdownModule {}
