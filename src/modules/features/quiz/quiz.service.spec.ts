import { Test } from '@nestjs/testing';
import { JwtPayloadDTO } from 'src/modules/commons/auth/dtos/auth.dto';
import { CronService } from 'src/modules/commons/cron/cron.service';
import { QuestionType } from 'src/modules/datasources/entities/questions.entity';
import { BaseQuizRepository } from 'src/modules/datasources/repositories/base-quiz.repository';
import { CreateQuizReqBodyDTO } from 'src/modules/features/quiz/dtos/create-quiz.dto';
import { QuizService } from 'src/modules/features/quiz/quiz.service';
import { InternalService } from '../internal/internal.service';

describe('QuizService', () => {
  let quizService: QuizService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        QuizService,
        {
          provide: BaseQuizRepository,
          useValue: {
            insert: jest.fn().mockImplementation(() =>
              Promise.resolve({
                identifiers: [{ _id: 1 }],
              }),
            ),
            findOneAndUpdate: jest.fn(),
          },
        },
        {
          provide: CronService,
          useValue: {
            listJobs: jest.fn(),
            createJob: jest.fn(),
            deleteJob: jest.fn(),
            deleteAllJobs: jest.fn(),
            createStartJob: jest.fn(),
            createEndJob: jest.fn(),
          },
        },
        {
          provide: InternalService,
          useValue: {
            startQuiz: jest.fn(),
            mapUserToEmailParticipant: jest.fn(),
          },
        },
      ],
    }).compile();

    quizService = moduleRef.get<QuizService>(QuizService);
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

    const quizId = await quizService.createQuiz(payload, jwt);
    expect(quizId).toBe(1);
  });
});
