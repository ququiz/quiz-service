import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import amqp, { ChannelWrapper } from 'amqp-connection-manager';
import { ConfirmChannel } from 'amqplib';
import { UserAnswerMQDTO } from './dtos/user-answer.dto';

@Injectable()
export class ConsumerService implements OnModuleInit {
  private channelWrapper: ChannelWrapper;
  private readonly logger = new Logger(ConsumerService.name);
  private readonly EXCHANGE_NAME = 'quiz-command-quiz-query';
  private readonly EXCHANGE_TYPE = 'topic';
  private readonly QUEUE_NAME = 'userAnswerQueue';
  private readonly ROUTING_KEY = 'user-answer';

  constructor() {
    const connection = amqp.connect(['amqp://localhost']);
    this.channelWrapper = connection.createChannel({
      setup: async (channel: ConfirmChannel) => {
        await channel.assertExchange(this.EXCHANGE_NAME, this.EXCHANGE_TYPE, {
          durable: true,
        });
        await channel.assertQueue(this.QUEUE_NAME, { durable: true });
        await channel.bindQueue(
          this.QUEUE_NAME,
          this.EXCHANGE_NAME,
          this.ROUTING_KEY,
        );
      },
    });
  }

  public async onModuleInit() {
    try {
      await this.channelWrapper.addSetup(async (channel: ConfirmChannel) => {
        await channel.consume(this.QUEUE_NAME, async (message) => {
          if (message) {
            const content = JSON.parse(
              message.content.toString(),
            ) as UserAnswerMQDTO;
            this.logger.log('Received message:', content);
            // TODO: input the logic to save the user answer to the database
            channel.ack(message);
          }
        });
      });
      this.logger.log('Consumer service started and listening for messages.');
    } catch (err) {
      this.logger.error('Error starting the consumer:', err);
    }
  }
}
