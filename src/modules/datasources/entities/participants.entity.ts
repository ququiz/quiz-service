import { Column, ObjectId, ObjectIdColumn } from 'typeorm';

export enum ParticipantStatus {
  NotStarted = 'NOT_STARTED',
  InProgress = 'IN_PROGRESS',
  Done = 'DONE',
}

export class Participant {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  user_id: string;

  @Column()
  final_score: number;

  @Column()
  status: ParticipantStatus;
}
