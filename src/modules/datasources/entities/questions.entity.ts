import { Column, ObjectId, ObjectIdColumn } from 'typeorm';
import { Choice } from './choices.entity';

export enum QuestionType {
  Multiple = 'MULTIPLE',
  Essay = 'ESSAY',
}

export class Question {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  question: string;

  @Column()
  type: QuestionType;

  @Column(() => Choice)
  choices: Choice[];

  @Column()
  correct_answer: string;

  @Column()
  user_answer: UserAnswer[];

  @Column()
  weight: number;
}

export class UserAnswer {
  @Column()
  participant_id: string;

  @Column()
  choice_id: string;

  @Column()
  answer: string;
}
