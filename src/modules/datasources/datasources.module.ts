import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BaseQuiz } from './entities/base-quiz.entity';
import { BaseQuizRepository } from './repositories/base-quiz.repository';
import { Question } from './entities/questions.entity';
import { Choice } from './entities/choices.entity';
import { UserAnswer } from './entities/user-answer.entity';
import { Participant } from './entities/participants.entity';

const repositories = [BaseQuizRepository];

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forRoot()],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mongodb',
        username: configService.get('MONGO_USERNAME'),
        password: configService.get('MONGO_PASSWORD'),
        host: configService.get('MONGO_HOST'),
        port: configService.get('MONGO_PORT'),
        synchronize: true,
        entities: [BaseQuiz, Choice, Participant, Question, UserAnswer],
      }),
    }),
    TypeOrmModule.forFeature([BaseQuiz]),
  ],
  providers: [...repositories],
  exports: [...repositories],
})
export class DatasourcesModule {}
