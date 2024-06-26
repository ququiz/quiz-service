import { BadRequestException, Injectable } from '@nestjs/common';
import { BaseQuizRepository } from 'src/modules/datasources/repositories/base-quiz.repository';
import {
  AddQuizParticipantDTO,
  CreateQuizQuestionChoiceDTO,
  CreateQuizQuestionDTO,
  CreateQuizReqBodyDTO,
  UpdateQuizDTO,
} from './dtos/create-quiz.dto';
import {
  BaseQuiz,
  BaseQuizStatus,
} from 'src/modules/datasources/entities/base-quiz.entity';
import {
  Question,
  QuestionType,
} from 'src/modules/datasources/entities/questions.entity';
import { Choice } from 'src/modules/datasources/entities/choices.entity';
import { JwtPayloadDTO } from 'src/modules/commons/auth/dtos/auth.dto';
import { ObjectId } from 'mongodb';
import {
  Participant,
  ParticipantStatus,
} from 'src/modules/datasources/entities/participants.entity';
import { CronService } from 'src/modules/commons/cron/cron.service';
import { ScheduleTime } from 'src/modules/commons/cron/dtos/create-schedule.dto';
import { InternalService } from '../internal/internal.service';
import { QuizNotifTimeType } from 'src/helpers/enums';

@Injectable()
export class QuizService {
  constructor(
    private readonly baseQuizRepository: BaseQuizRepository,
    private readonly cronsService: CronService,
    private readonly internalService: InternalService,
  ) {}

  public async createQuiz(
    payload: CreateQuizReqBodyDTO,
    jwt: JwtPayloadDTO,
  ): Promise<string> {
    const { title, start_time, end_time } = payload;
    const baseQuiz = new BaseQuiz();

    if (payload.start_time > payload.end_time)
      throw new BadRequestException('Start time must be before end time');

    if (payload.end_time < new Date(Date.now()))
      throw new BadRequestException('End time must be in the future');

    const now = Date.now();

    baseQuiz.name = title;
    baseQuiz.start_time = start_time;
    baseQuiz.end_time = end_time;
    baseQuiz.status = BaseQuizStatus.NotStarted;

    const schedules: string[] = [];

    const startTimeDate = start_time.getTime();

    const diff = startTimeDate - now;

    if (diff > 0) {
      schedules.push(new Date(startTimeDate).toISOString());
      if (diff > ScheduleTime.ThirtyMinutes) {
        schedules.push(
          new Date(startTimeDate - ScheduleTime.ThirtyMinutes).toISOString(),
        );

        if (diff > ScheduleTime.OneDay)
          schedules.push(
            new Date(startTimeDate - ScheduleTime.OneDay).toISOString(),
          );
      }
    } else baseQuiz.status = BaseQuizStatus.InProgress;

    baseQuiz._id = new ObjectId();
    baseQuiz.passcode = Math.random().toString(36).substring(7);
    baseQuiz.creator_id = jwt.sub;
    baseQuiz.questions = payload.questions.map((question) =>
      this.mapCreateQuestionDTOToQuestion(question),
    );

    if (schedules.length)
      await this.cronsService.createStartJob(
        baseQuiz._id.toHexString(),
        schedules,
      );

    await this.cronsService.createEndJob(
      baseQuiz._id.toHexString(),
      end_time.toISOString(),
    );

    const result = await this.baseQuizRepository.insert(baseQuiz);

    return result.identifiers[0]._id;
  }

  //add quiz participant method
  public async addQuizParticipant(
    payload: AddQuizParticipantDTO,
    jwt: JwtPayloadDTO,
    quizId: string,
  ): Promise<void> {
    const baseQuiz = await this.baseQuizRepository.findOneBy({
      _id: new ObjectId(quizId),
    });

    if (!baseQuiz) throw new BadRequestException('Quiz not found');

    if (baseQuiz.creator_id !== jwt.sub)
      throw new BadRequestException('You are not the creator of this quiz');

    if (baseQuiz.status !== BaseQuizStatus.NotStarted)
      throw new BadRequestException('Cannot add participant to started quiz');

    const newParticipant = {
      _id: new ObjectId(),
      user_id: payload.participant_id,
      final_score: 0,
      status: ParticipantStatus.NotStarted,
    };

    if (!baseQuiz.participants) {
      baseQuiz.participants = [newParticipant];
    } else {
      const participantExists = baseQuiz.participants.find(
        (participant) => participant.user_id === payload.participant_id,
      );

      if (participantExists) {
        throw new BadRequestException('Participant already added');
      }
      baseQuiz.participants.push(newParticipant);
    }

    await this.baseQuizRepository.findOneAndUpdate(
      { _id: new ObjectId(quizId) },
      { $set: { participants: baseQuiz.participants } },
    );
  }

  //update quiz instance
  public async updateQuiz(
    quizId: string,
    payload: UpdateQuizDTO,
    jwt: JwtPayloadDTO,
  ): Promise<void> {
    const baseQuiz = await this.baseQuizRepository.findOneBy({
      _id: new ObjectId(quizId),
    });

    if (!baseQuiz) throw new BadRequestException('Quiz not found');

    if (baseQuiz.creator_id !== jwt.sub)
      throw new BadRequestException('You are not the creator of this quiz');

    if (baseQuiz.status !== BaseQuizStatus.NotStarted)
      throw new BadRequestException('Cannot update started quiz');

    if (payload.start_time > payload.end_time)
      throw new BadRequestException('Start time must be before end time');

    //handle update only on the fields that are not null
    const updateFields: Partial<BaseQuiz> = {};

    if (payload.title) updateFields.name = payload.title;
    if (payload.start_time) {
      updateFields.start_time = payload.start_time;

      if (payload.start_time < new Date(Date.now()))
        throw new BadRequestException('Start time must be in the future');

      const now = Date.now();

      const startTimeDate = payload.start_time.getTime();

      const diff = startTimeDate - now;

      const schedules: string[] = [new Date(startTimeDate).toISOString()];

      const deleteJobPromises: Promise<void>[] = [];

      if (diff > ScheduleTime.ThirtyMinutes) {
        schedules.push(
          new Date(startTimeDate - ScheduleTime.ThirtyMinutes).toISOString(),
        );

        if (diff > ScheduleTime.OneDay)
          schedules.push(
            new Date(startTimeDate - ScheduleTime.OneDay).toISOString(),
          );
        else
          deleteJobPromises.push(
            this.cronsService.deleteJob(`start_quiz_${quizId}_2`),
          );
      } else
        deleteJobPromises.push(
          this.cronsService.deleteJob(`start_quiz_${quizId}_1`),
        );

      Promise.all([
        this.cronsService.createStartJob(quizId, schedules),
        ...deleteJobPromises,
      ]);
    }

    if (payload.end_time) {
      if (
        payload.end_time < new Date(Date.now()) ||
        payload.end_time < baseQuiz.start_time
      )
        throw new BadRequestException('End time must be in the future');

      updateFields.end_time = payload.end_time;
      this.cronsService.createEndJob(quizId, payload.end_time.toISOString());
    }

    if (payload.questions) {
      updateFields.questions = payload.questions.map((question) =>
        this.mapCreateQuestionDTOToQuestion(question),
      );
    }

    await this.baseQuizRepository.findOneAndUpdate(
      { _id: new ObjectId(quizId) },
      { $set: updateFields },
    );
  }

  //delete quiz instance
  public async deleteQuiz(quizId: string, jwt: JwtPayloadDTO): Promise<void> {
    const baseQuiz = await this.baseQuizRepository.findOneBy({
      _id: new ObjectId(quizId),
    });

    if (!baseQuiz) throw new BadRequestException('Quiz not found');

    if (baseQuiz.creator_id !== jwt.sub)
      throw new BadRequestException('You are not the creator of this quiz');

    Promise.all([
      this.baseQuizRepository.findOneAndDelete({
        _id: new ObjectId(quizId),
      }),
      this.cronsService.deleteAllJobs(quizId),
    ]);
  }

  public async joinQuiz(quizId: string, jwt: JwtPayloadDTO): Promise<void> {
    const baseQuiz = await this.baseQuizRepository.findOne({
      where: { _id: new ObjectId(quizId) },
      select: {
        status: true,
        participants: true,
      },
    });

    if (!baseQuiz) throw new BadRequestException('Quiz not found');
    if (baseQuiz.status === BaseQuizStatus.Done)
      throw new BadRequestException('Quiz has ended');
    if (baseQuiz.participants?.length) {
      const participantExists = baseQuiz.participants.find(
        (participant) => participant.user_id === jwt.sub,
      );

      if (participantExists)
        throw new BadRequestException('You have already joined this quiz');
    }

    const newParticipant = new Participant();

    newParticipant._id = new ObjectId();
    newParticipant.user_id = jwt.sub;
    newParticipant.status = ParticipantStatus.NotStarted;

    await this.baseQuizRepository.findOneAndUpdate(
      { _id: new ObjectId(quizId) },
      { $push: { participants: newParticipant } },
    );
  }

  public async participantStartQuiz(
    quizId: string,
    jwt: JwtPayloadDTO,
  ): Promise<void> {
    const baseQuiz = await this.baseQuizRepository.findOne({
      where: { _id: new ObjectId(quizId) },
      select: {
        status: true,
        participants: true,
        creator_id: true,
      },
    });

    if (
      jwt.sub === baseQuiz.creator_id &&
      baseQuiz.status === BaseQuizStatus.NotStarted
    ) {
      await this.forceStartQuiz(baseQuiz);
    }

    const participantExistance = baseQuiz.participants?.find(
      (participant) => participant.user_id === jwt.sub,
    );

    if (!participantExistance)
      throw new BadRequestException('You are not a participant of this quiz');

    if (participantExistance.status !== ParticipantStatus.NotStarted)
      throw new BadRequestException('You have already started this quiz');

    if (baseQuiz.status === BaseQuizStatus.NotStarted)
      throw new BadRequestException('Quiz has not started');

    if (baseQuiz.status === BaseQuizStatus.Done)
      throw new BadRequestException('Quiz has ended');

    await this.baseQuizRepository.findOneAndUpdate(
      { _id: new ObjectId(quizId), 'participants.user_id': jwt.sub },
      { $set: { 'participants.$.status': ParticipantStatus.InProgress } },
    );
  }

  private async forceStartQuiz(quiz: BaseQuiz): Promise<void> {
    await this.cronsService.deleteAllJobs(quiz._id.toHexString());

    await this.internalService.startQuiz(quiz._id.toHexString(), {
      time: QuizNotifTimeType.T1,
    });
  }

  private mapCreateQuestionDTOToQuestion(
    question: CreateQuizQuestionDTO,
  ): Question {
    const newQuestion = new Question();
    newQuestion._id = new ObjectId();
    newQuestion.question = question.question;
    newQuestion.type = question.type;
    newQuestion.weight = question.weight;

    if (question.type === QuestionType.Multiple) {
      if (!question.choices || question.choices.length < 2)
        throw new BadRequestException(
          'Multiple choice questions must have at least 2 choices',
        );

      newQuestion.choices = question.choices.map((choice) =>
        this.mapChoiceDTOToChoice(choice),
      );
    }

    if (question.type === QuestionType.Essay)
      newQuestion.correct_answer = question.essay_answer;

    return newQuestion;
  }

  private mapChoiceDTOToChoice(choice: CreateQuizQuestionChoiceDTO): Choice {
    const newChoice = new Choice();
    newChoice._id = new ObjectId();
    newChoice.text = choice.text;
    newChoice.is_correct = choice.is_correct ?? false;

    return newChoice;
  }
}
