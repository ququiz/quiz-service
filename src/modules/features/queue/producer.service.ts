import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import amqp, { ChannelWrapper } from 'amqp-connection-manager';
import { Channel } from 'amqplib';

@Injectable()
export class ProducerService {
  private channelWrapper: ChannelWrapper;
  constructor(private readonly configService: ConfigService) {
    const connection = amqp.connect([
      this.configService.get<string>('RABBITMQ_URL'),
    ]);
    this.channelWrapper = connection.createChannel({
      setup: (channel: Channel) => {
        return channel.assertQueue('...', { durable: true });
      },
    });
  }
}
