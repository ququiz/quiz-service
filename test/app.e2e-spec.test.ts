import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { QuizService } from 'src/modules/features/quiz/quiz.service';
import { CreateQuizReqBodyDTO } from 'src/modules/features/quiz/dtos/create-quiz.dto';
import { JwtPayloadDTO } from 'src/modules/commons/auth/dtos/auth.dto';
import { QuestionType } from 'src/modules/datasources/entities/questions.entity';
import { QuizController } from 'src/modules/features/quiz/quiz.controller';

describe('QuizController (e2e)', () => {
  let app: INestApplication;
  let quizService: QuizService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [QuizController],
      providers: [QuizService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    quizService = moduleFixture.get<QuizService>(QuizService);
  });

  afterEach(async () => {
    await app.close();
  });

  it('should create quiz', async () => {
    const payload: CreateQuizReqBodyDTO = {
      title: 'Quiz Test #2 (Cron)',
      questions: [
        {
          question: 'Test?',
          type: QuestionType.Essay,
          essay_answer: 'Hell no!',
          weight: 2,
        },
      ],
      start_time: new Date(Date.now()),
      end_time: new Date(Date.now() + 1000 * 60 * 60 * 24),
    };
    const jwt: JwtPayloadDTO = {
      sub: '1',
      exp: 0,
      iat: 0,
      username: 'test',
    };

    jest.spyOn(quizService, 'createQuiz').mockResolvedValueOnce(1);

    const response = await request(app.getHttpServer())
      .post('/quiz')
      .send(payload)
      .set('Authorization', `Bearer ${jwt}`)
      .expect(201);

    expect(response.body).toEqual({ quizId: 1 });
  });
});
