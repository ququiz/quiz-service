import { Column, ObjectId, ObjectIdColumn } from 'typeorm';

export class Participant {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  user_id: string;

  @Column()
  final_score: number;

  @Column()
  status: string;
}
