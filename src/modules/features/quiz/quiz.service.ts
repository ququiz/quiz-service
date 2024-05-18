import { BadRequestException, Injectable } from '@nestjs/common';
import { BaseQuizRepository } from 'src/modules/datasources/repositories/base-quiz.repository';
import {
  CreateQuizQuestionChoiceDTO,
  CreateQuizQuestionDTO,
  CreateQuizReqBodyDTO,
} from './dtos/create-quiz.dto';
import {
  BaseQuiz,
  BaseQuizStatus,
} from 'src/modules/datasources/entities/base-quiz.entity';
import { randomUUID } from 'crypto';
import {
  Question,
  QuestionType,
} from 'src/modules/datasources/entities/questions.entity';
import { Choice } from 'src/modules/datasources/entities/choices.entity';

@Injectable()
export class QuizService {
  constructor(private readonly baseQuizRepository: BaseQuizRepository) {}

  public async createQuiz(payload: CreateQuizReqBodyDTO): Promise<string> {
    const baseQuiz = new BaseQuiz();

    if (payload.start_time > payload.end_time)
      throw new BadRequestException('Start time must be before end time');

    baseQuiz.name = payload.title;
    baseQuiz.start_time = payload.start_time;
    baseQuiz.end_time = payload.end_time;
    baseQuiz.status = BaseQuizStatus.NotStarted;

    if (payload.start_time < new Date())
      baseQuiz.status = BaseQuizStatus.InProgress;

    baseQuiz.passcode = Math.random().toString(36).substring(7);
    baseQuiz.creator_id = randomUUID(); // mock implementation
    baseQuiz.questions = payload.questions.map((question) =>
      this.mapCreateQuestionDTOToQuestion(question),
    );

    const result = await this.baseQuizRepository.insert(baseQuiz);

    return result.identifiers[0].id;
  }

  private mapCreateQuestionDTOToQuestion(
    question: CreateQuizQuestionDTO,
  ): Question {
    const newQuestion = new Question();
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
    newChoice.text = choice.text;
    newChoice.is_correct = choice.is_correct ?? false;

    return newChoice;
  }
}
