export enum QuizEmailTime {
  D1 = 'D-1',
  T30 = 'T-30',
  T1 = 'T-1',
}

export class QuizEmailParticipantDTO {
  email: string;
  name: string;
}

export class QuizEmailDTO {
  time: QuizEmailTime;
  name: string;
  participants: QuizEmailParticipantDTO[];

  constructor(
    time: QuizEmailTime,
    name: string,
    participants: QuizEmailParticipantDTO[],
  ) {
    this.time = time;
    this.name = name;
    this.participants = participants;
  }
}
