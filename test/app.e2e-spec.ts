import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
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
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CronModule } from 'src/modules/commons/cron/cron.module';
import { AuthModule } from 'src/modules/commons/auth/auth.module';
import { UsersModule } from 'src/modules/commons/users/users.module';
import { InternalService } from 'src/modules/features/internal/internal.service';
import { ProducerService } from 'src/modules/commons/queue/producer.service';
import { ConsumerService } from 'src/modules/commons/queue/consumer.service';
import { JwtGuard } from 'src/modules/commons/auth/guards/jwt.guard';

describe('QuizController (e2e)', () => {
  let app: INestApplication;
  let quizRepository: BaseQuizRepository;
  let mongodbContainer: StartedMongoDBContainer;

  beforeAll(async () => {
    mongodbContainer = await new MongoDBContainer('mongo:6.0.1').start();

    const url = mongodbContainer.getConnectionString();

    const appModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRoot({
          directConnection: true,
          type: 'mongodb',
          url,
          entities: [BaseQuiz],
        }),
        TypeOrmModule.forFeature([BaseQuiz]),
        AuthModule,
        CronModule,
        UsersModule,
      ],
      controllers: [QuizController],
      providers: [
        QuizService,
        ConfigService,
        BaseQuizRepository,
        InternalService,
        ConfigService,
        ProducerService,
        ConsumerService,
      ],
    })
      .overrideGuard(JwtGuard)
      .useValue({ canActivate: () => true })
      .compile();

    quizRepository = appModule.get<BaseQuizRepository>(BaseQuizRepository);

    app = appModule.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        validateCustomDecorators: true,
      }),
    );
    await app.init();
  }, 70000);

  afterAll(async () => {
    await app.close();
    await mongodbContainer.stop();
  });

  it('/quiz (POST)', async () => {
    const payload = {
      title: 'Quiz Test #2 (Cron)',
      questions: [
        {
          question: 'Test?',
          type: 'ESSAY',
          essay_answer: 'Hell no!',
          weight: 2,
        },
      ],
      start_time: 1816465358423,
      end_time: 1816468358423,
    };

    const response = await request(app.getHttpServer())
      .post('/quiz')
      .set(
        'Authorization',
        'Bearer eyJhbGciOiJFUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFuZHJlbmsyIiwiaWF0IjoxNzE3NDk0MDA1LCJleHAiOjE3MTc0OTQ5MDUsInN1YiI6Ijg5YjhmNTQyLTBkMDUtNGEzZi1hOWI1LTI0MzFhNWFjZWQwYSJ9.AcaA2RbpL3sE2Y3-e7twc18FwEMPeO4OXZarVX8frBmgKkKVe0vVxx4I2kGBGzKMoyiSL7v40RrmhO_tUXLWg0GHAajv4hroO-VmaOdjfXrmo5mcl1sIeUb6HdW4Li4ZLj4j5DKi2YlM7Djwl5heWlNhL_7SizbiuWtW8Z9pS8Vnrntf',
      )
      .send(payload)
      .expect(201);

    const quiz = await quizRepository.findOneOrFail(
      response.body.data.created_quiz.id,
    );

    expect(response.body.data.created_quiz.id).toStrictEqual(
      quiz._id.toHexString(),
    );
  });
});
