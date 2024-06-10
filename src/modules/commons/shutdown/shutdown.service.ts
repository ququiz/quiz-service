import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ConsumerService } from '../queue/consumer.service';
import { ProducerService } from '../queue/producer.service';

@Injectable()
export class ShutdownService implements OnModuleDestroy {
  constructor(
    private readonly dataSource: DataSource,
    private readonly queueConsumerService: ConsumerService,
    private readonly queueProducerService: ProducerService,
  ) {}

  async onModuleDestroy() {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    console.log('Closing connections gracefully...');
    await this.closeDatabaseConnection();
    await this.closeRabbitMQConnection();
    console.log('Connections closed successfully');
  }

  private async closeDatabaseConnection() {
    console.log('Closing database connection...');
    await this.dataSource.destroy();
  }

  private async closeRabbitMQConnection() {
    console.log('Closing RabbitMQ Consumer connection...');
    await this.queueConsumerService.closeConnection();

    console.log('Closing RabbitMQ Producer connection...');
    await this.queueProducerService.closeConnection();
  }
}
