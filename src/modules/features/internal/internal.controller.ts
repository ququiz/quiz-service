import { Body, Controller, Param, Post } from '@nestjs/common';
import { InternalService } from './internal.service';
import { SuccessResponse } from 'src/helpers/interfaces';
import { StartQuizReqBodyDTO } from './dtos/start-quiz.dto';

@Controller('quiz-internal')
export class InternallController {
  constructor(private readonly internalService: InternalService) {}

  @Post(':quizId/start')
  public async postStartQuiz(
    @Param('quizId') quizId: string,
    @Body() body: StartQuizReqBodyDTO,
  ): Promise<SuccessResponse<void>> {
    await this.internalService.startQuiz(quizId, body);

    return {
      message: 'Quiz started successfully',
    };
  }
}
