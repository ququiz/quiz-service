import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  MongoDBContainer,
  StartedMongoDBContainer,
} from '@testcontainers/mongodb';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizController } from 'src/modules/features/quiz/quiz.controller';
import { QuizService } from 'src/modules/features/quiz/quiz.service';
import { BaseQuiz } from 'src/modules/datasources/entities/base-quiz.entity';
import { BaseQuizRepository } from 'src/modules/datasources/repositories/base-quiz.repository';

describe('QuizController (e2e)', () => {
  let app: INestApplication;
  let quizRepository: BaseQuizRepository;
  let mongodbContainer: StartedMongoDBContainer;

  beforeAll(async () => {
    mongodbContainer = await new MongoDBContainer('mongo:6.0.1').start();

    const url = mongodbContainer.getConnectionString();

    const appModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          directConnection: true,
          type: 'mongodb',
          url,
          database: 'order-service',
          entities: [BaseQuiz],
        }),
      ],
      controllers: [QuizController],
      providers: [QuizService, BaseQuizRepository],
    }).compile();

    quizRepository = appModule.get<BaseQuizRepository>(BaseQuizRepository);

    app = appModule.createNestApplication();

    await app.init();
  }, 70000);

  afterAll(async () => {
    await app.close();
    await mongodbContainer.stop();
  });

  it('/quiz 9 (POST)', async () => {
    const payload = {
      title: 'Quiz Test #2 (Cron)',
      questions: [
        {
          question: 'Test?',
          type: 'Essay',
          essay_answer: 'Hell no!',
          weight: 2,
        },
      ],
      start_time: new Date(Date.now()),
      end_time: new Date(Date.now() + 1000 * 60 * 60 * 24),
    };

    const response = await request(app.getHttpServer())
      .post('/quiz')
      .send(payload)
      .expect(201);

    const quiz = await quizRepository.findOneOrFail(
      response.body.data.created_quiz.id,
    );

    expect(response.body.data.created_quiz.id).toEqual({ quizId: quiz._id });
  });
});
