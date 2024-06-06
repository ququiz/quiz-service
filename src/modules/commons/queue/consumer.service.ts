import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import amqp, { ChannelWrapper } from 'amqp-connection-manager';
import { ConfirmChannel } from 'amqplib';
import { UserAnswerMQDTO } from './dtos/user-answer.dto';
import { ConfigService } from '@nestjs/config';
import { BaseQuizRepository } from 'src/modules/datasources/repositories/base-quiz.repository';
import { UserAnswer } from 'src/modules/datasources/entities/questions.entity';
import { ObjectId } from 'mongodb';

@Injectable()
export class ConsumerService implements OnModuleInit {
  private channelWrapper: ChannelWrapper;
  private readonly logger = new Logger(ConsumerService.name);
  private readonly EXCHANGE_NAME = 'quiz-command-quiz-query';
  private readonly EXCHANGE_TYPE = 'topic';
  private readonly QUEUE_NAME = 'userAnswerQueue';
  private readonly ROUTING_KEY = 'user-answer';

  constructor(
    private readonly configService: ConfigService,
    private readonly baseQuizRepository: BaseQuizRepository,
  ) {
    const connection = amqp.connect([
      this.configService.get<string>('RABBITMQ_URL'),
    ]);
    this.channelWrapper = connection.createChannel({
      setup: async (channel: ConfirmChannel) => {
        await channel.assertExchange(this.EXCHANGE_NAME, this.EXCHANGE_TYPE, {
          durable: true,
        });
        // await channel.assertQueue(this.QUEUE_NAME, { durable: true });
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
        // await channel.assertQueue(this.QUEUE_NAME, { durable: true });
        await channel.consume(this.QUEUE_NAME, async (message) => {
          if (message) {
            console.log("content: " +  message.content.toString())

            const content = JSON.parse(
              message.content.toString()
            ) as UserAnswerMQDTO;
            console.log("content after json parse: " +  message.content.toString())
            const newAnswer = new UserAnswer();
            newAnswer.choice_id = content.choice_id;
            newAnswer.answer = content.answer;
            newAnswer.participant_id = content.participant_id;

            await this.baseQuizRepository.findOneAndUpdate(
              {
                _id: new ObjectId(content.quiz_id),
                'questions._id': new ObjectId(content.question_id),
              },
              {
                $push: { 'questions.$.user_answer': newAnswer },
              },
            );

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
