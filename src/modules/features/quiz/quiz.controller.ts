import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { QuizService } from './quiz.service';
import {
  AddQuizParticipantResDTO,
  CreateQuizReqBodyDTO,
  CreateQuizResDTO,
  UpdateQuizDTO,
} from './dtos/create-quiz.dto';
import { SuccessResponse } from 'src/helpers/interfaces';
import { JwtGuard } from 'src/modules/commons/auth/guards/jwt.guard';
import { JWT } from 'src/modules/commons/auth/decorators/jwt.decorator';
import { JwtPayloadDTO } from 'src/modules/commons/auth/dtos/auth.dto';
import { CronService } from '../cron/cron.service';

@Controller('quiz')
export class QuizController {
  constructor(
    private readonly quizService: QuizService,
    private readonly cronService: CronService,
  ) {}

  @Post()
  @UseGuards(JwtGuard)
  public async postCreateQuiz(
    @Body() body: CreateQuizReqBodyDTO,
    @JWT() jwt: JwtPayloadDTO,
  ): Promise<SuccessResponse<CreateQuizResDTO>> {
    const quizId = await this.quizService.createQuiz(body, jwt);

    return {
      message: 'Quiz created successfully',
      data: {
        created_quiz: {
          id: quizId,
        },
      },
    };
  }

  //update quiz method endpoint
  @Put(':quizId')
  @UseGuards(JwtGuard)
  public async postUpdateQuiz(
    @Body() body: UpdateQuizDTO,
    @JWT() jwt: JwtPayloadDTO,
    @Param('quizId') quizId: string,
  ): Promise<SuccessResponse<void>> {
    await this.quizService.updateQuiz(quizId, body, jwt);

    return {
      message: 'Quiz updated successfully',
    };
  }

  //add quiz participant endpoint
  @Post(':quizId/participant')
  @UseGuards(JwtGuard)
  public async postAddQuizParticipant(
    @Body() body: { participant_id: string },
    @JWT() jwt: JwtPayloadDTO,
    @Param('quizId') quizId: string,
  ): Promise<SuccessResponse<AddQuizParticipantResDTO>> {
    await this.quizService.addQuizParticipant(body, jwt, quizId);

    return {
      message: 'Participant added successfully',
    };
  }

  //delete quiz method endpoint
  @Delete(':quizId')
  @UseGuards(JwtGuard)
  public async postDeleteQuiz(
    @Param('quizId') quizId: string,
    @JWT() jwt: JwtPayloadDTO,
  ): Promise<SuccessResponse<string>> {
    await this.quizService.deleteQuiz(quizId, jwt);

    //delete cron jobs
    await this.cronService.deleteJob(quizId);

    return {
      message: 'Quiz deleted successfully',
    };
  }

  @Post(':quizId/join')
  @UseGuards(JwtGuard)
  public async postJoinQuiz(
    @Param('quizId') quizId: string,
    @JWT() jwt: JwtPayloadDTO,
  ): Promise<SuccessResponse<string>> {
    await this.quizService.joinQuiz(quizId, jwt);

    return {
      message: 'Quiz joined successfully',
    };
  }

  @Post(':quizId/start')
  @UseGuards(JwtGuard)
  public async postStartParticipantQuiz(
    @Param('quizId') quizId: string,
    @JWT() jwt: JwtPayloadDTO,
  ): Promise<SuccessResponse<void>> {
    await this.quizService.participantStartQuiz(quizId, jwt);

    return {
      message: 'Quiz started successfully',
    };
  }
}
