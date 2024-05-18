import { Injectable } from '@nestjs/common';
import { DataSource, MongoRepository } from 'typeorm';
import { BaseQuiz } from '../entities/base-quiz.entity';

@Injectable()
export class BaseQuizRepository extends MongoRepository<BaseQuiz> {
  constructor(private readonly datasource: DataSource) {
    super(BaseQuiz, datasource.createEntityManager());
  }
}
