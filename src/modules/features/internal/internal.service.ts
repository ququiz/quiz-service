import { Injectable } from '@nestjs/common';
import { BaseQuizStatus } from 'src/modules/datasources/entities/base-quiz.entity';
import { BaseQuizRepository } from 'src/modules/datasources/repositories/base-quiz.repository';
import { ObjectId } from 'typeorm';
import { StartQuizReqBodyDTO } from './dtos/start-quiz.dto';
import { QuizNotifTimeType } from 'src/helpers/enums';
import { UsersService } from 'src/modules/commons/users/users.service';
import { ProducerService } from 'src/modules/commons/queue/producer.service';
import {
  QuizEmailDTO,
  QuizEmailParticipantDTO,
} from 'src/modules/commons/queue/dtos/quiz-email.dto';
import { User } from 'src/modules/commons/users/interfaces/users.interface';

@Injectable()
export class InternalService {
  constructor(
    private readonly baseQuizRepository: BaseQuizRepository,
    private readonly usersService: UsersService,
    private readonly producerService: ProducerService,
  ) {}

  public async startQuiz(
    quizId: string,
    payload: StartQuizReqBodyDTO,
  ): Promise<void> {
    const quizObjectId = new ObjectId(quizId);
    const baseQuiz = await this.baseQuizRepository.findOne({
      where: { _id: quizObjectId },
      select: {
        _id: true,
        participants: true,
        name: true,
      },
    });

    const participantUserIds = baseQuiz.participants.map(
      (participant) => participant.user_id,
    );

    const gRPCRes = await this.usersService.getUserByIds(participantUserIds);

    const messageQueueReq = new QuizEmailDTO(
      payload.time,
      baseQuiz.name,
      gRPCRes.user.map(this.mapUserToEmailParticipant),
    );

    await this.producerService.sendQuizEmailMessage(messageQueueReq);

    if (payload.time === QuizNotifTimeType.T1)
      await this.baseQuizRepository.findOneAndUpdate(
        { _id: new ObjectId(quizId) },
        {
          $set: {
            status: BaseQuizStatus.InProgress,
          },
        },
      );
  }

  private mapUserToEmailParticipant(user: User): QuizEmailParticipantDTO {
    const participant = new QuizEmailParticipantDTO();
    participant.email = user.email;
    participant.name = user.fullname;
    return participant;
  }
}
