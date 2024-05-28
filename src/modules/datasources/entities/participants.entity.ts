import { Column, ObjectId, ObjectIdColumn } from 'typeorm';

export enum ParticipantStatus {
  NotStarted = 'Not Started',
  InProgress = 'In Progress',
  Done = 'Done',
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
