import { Column, ObjectId, ObjectIdColumn } from 'typeorm';

export class Choice {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  text: string;

  @Column()
  is_correct: boolean;
}
