import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import amqp, { ChannelWrapper } from 'amqp-connection-manager';
import { Channel } from 'amqplib';
import { QuizEmailDTO } from './dtos/quiz-email.dto';

@Injectable()
export class ProducerService {
  private readonly EXCHANGE_NAME = 'quiz.email.exchange';
  private readonly EXCHANGE_TYPE = 'direct';
  private readonly QUEUE_NAME = 'quiz.email.queue';
  private readonly ROUTING_KEY = 'quiz.email.send';
  private channelWrapper: ChannelWrapper;

  constructor(private readonly configService: ConfigService) {
    const connection = amqp.connect([
      this.configService.get<string>('RABBITMQ_URL'),
    ]);
    this.channelWrapper = connection.createChannel({
      setup: (channel: Channel) => {
        return Promise.all([
          channel.assertExchange(this.EXCHANGE_NAME, this.EXCHANGE_TYPE, {
            durable: true,
          }),
          channel.assertQueue(this.QUEUE_NAME, { durable: true }),
          channel.bindQueue(
            this.QUEUE_NAME,
            this.EXCHANGE_NAME,
            this.ROUTING_KEY,
          ),
        ]);
      },
    });
  }

  async sendQuizEmailMessage(quizEmailDTO: QuizEmailDTO) {
    try {
      await this.channelWrapper.sendToQueue(
        this.QUEUE_NAME,
        Buffer.from(JSON.stringify(quizEmailDTO)),
        { persistent: true },
      );
      console.log('Message sent:', quizEmailDTO);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  }
}
