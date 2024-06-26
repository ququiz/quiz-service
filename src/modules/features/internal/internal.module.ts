import { Module } from '@nestjs/common';
import { DatasourcesModule } from 'src/modules/datasources/datasources.module';
import { InternalController } from './internal.controller';
import { InternalService } from './internal.service';
import { UsersModule } from 'src/modules/commons/users/users.module';
import { QueueModule } from 'src/modules/commons/queue/queue.module';

@Module({
  imports: [DatasourcesModule, UsersModule, QueueModule],
  controllers: [InternalController],
  providers: [InternalService],
  exports: [InternalService],
})
export class InternalModule {}
