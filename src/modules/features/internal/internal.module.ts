import { Module } from '@nestjs/common';
import { DatasourcesModule } from 'src/modules/datasources/datasources.module';
import { InternallController } from './internal.controller';
import { InternalService } from './internal.service';
import { UsersModule } from '../users/users.module';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [DatasourcesModule, UsersModule, QueueModule],
  controllers: [InternallController],
  providers: [InternalService],
})
export class InternalModule {}
