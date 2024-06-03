import { Module } from '@nestjs/common';
import { DatasourcesModule } from 'src/modules/datasources/datasources.module';
import { InternallController } from './internal.controller';
import { InternalService } from './internal.service';

@Module({
  imports: [DatasourcesModule],
  controllers: [InternallController],
  providers: [InternalService],
})
export class InternalModule {}
