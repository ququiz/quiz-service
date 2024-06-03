import { Injectable } from '@nestjs/common';
import { BaseQuizStatus } from 'src/modules/datasources/entities/base-quiz.entity';
import { BaseQuizRepository } from 'src/modules/datasources/repositories/base-quiz.repository';
import { ObjectId } from 'typeorm';

@Injectable()
export class InternalService {
  constructor(private readonly baseQuizRepository: BaseQuizRepository) {}

  public async startQuiz(quizId: string) {
    await this.baseQuizRepository.findOneAndUpdate(
      { _id: new ObjectId(quizId) },
      {
        $set: {
          status: BaseQuizStatus.InProgress,
        },
      },
    );
  }
}
