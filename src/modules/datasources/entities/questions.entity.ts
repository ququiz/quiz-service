import { Column, ObjectId, ObjectIdColumn } from 'typeorm';
import { Choice } from './choices.entity';

export enum QuestionType {
  Multiple = 'MULTIPLE',
  Essay = 'ESSAY',
}

export class Question {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  question: string;

  @Column()
  type: QuestionType;

  @Column(() => Choice)
  choices: Choice[];

  @Column()
  correct_answer: string;

  @Column()
  weight: number;
}
