import { QuizNotifTimeType } from 'src/helpers/enums';

export class QuizEmailParticipantDTO {
  email: string;
  name: string;
}

export class QuizEmailDTO {
  time: QuizNotifTimeType;
  name: string;
  participants: QuizEmailParticipantDTO[];

  constructor(
    time: QuizNotifTimeType,
    name: string,
    participants: QuizEmailParticipantDTO[],
  ) {
    this.time = time;
    this.name = name;
    this.participants = participants;
  }
}
