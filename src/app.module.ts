import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatasourcesModule } from './modules/datasources/datasources.module';

@Module({
  imports: [DatasourcesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
