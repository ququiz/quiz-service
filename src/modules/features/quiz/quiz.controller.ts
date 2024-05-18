import { Body, Controller, Post } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { CreateQuizReqBodyDTO, CreateQuizResDTO } from './dtos/create-quiz.dto';
import { SuccessResponse } from 'src/helpers/interfaces';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post()
  public async postCreateQuiz(
    @Body() body: CreateQuizReqBodyDTO,
  ): Promise<SuccessResponse<CreateQuizResDTO>> {
    const quizId = await this.quizService.createQuiz(body);

    return {
      message: 'Quiz created successfully',
      data: {
        created_quiz: {
          id: quizId,
        },
      },
    };
  }
}
