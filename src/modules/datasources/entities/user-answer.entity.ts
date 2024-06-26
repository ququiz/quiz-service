import { Column, Entity, ObjectId, ObjectIdColumn } from 'typeorm';

@Entity()
export class UserAnswer {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  questionID: string;

  @Column()
  choiceID: string;

  @Column()
  participantID: string;

  @Column()
  answer: string;
}
