import { Entity, ObjectIdColumn, Column, ObjectId } from 'typeorm';
import { Question } from './questions.entity';
import { Participant } from './participants.entity';

export enum BaseQuizStatus {
  NotStarted = 'NOT_STARTED',
  InProgress = 'IN_PROGRESS',
  Done = 'DONE',
}

@Entity()
export class BaseQuiz {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  name: string;

  @Column()
  creator_id: string;

  @Column()
  passcode: string;

  @Column()
  start_time: Date;

  @Column()
  end_time: Date;

  @Column(() => Question)
  questions: Question[];

  @Column(() => Participant)
  participants: Participant[];

  @Column()
  status: BaseQuizStatus;
}
