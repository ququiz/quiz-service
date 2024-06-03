import { Controller, Param, Post } from '@nestjs/common';
import { InternalService } from './internal.service';
import { SuccessResponse } from 'src/helpers/interfaces';

@Controller('quiz-internal')
export class InternallController {
  constructor(private readonly internalService: InternalService) {}

  @Post(':quizId/start')
  public async postStartQuiz(
    @Param('quizId') quizId: string,
  ): Promise<SuccessResponse<void>> {
    await this.internalService.startQuiz(quizId);

    return {
      message: 'Quiz started successfully',
    };
  }
}
