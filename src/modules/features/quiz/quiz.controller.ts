import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { CreateQuizReqBodyDTO, CreateQuizResDTO } from './dtos/create-quiz.dto';
import { SuccessResponse } from 'src/helpers/interfaces';
import { JwtGuard } from 'src/modules/commons/auth/guards/jwt.guard';
import { JWT } from 'src/modules/commons/auth/decorators/jwt.decorator';
import { JwtPayloadDTO } from 'src/modules/commons/auth/dtos/auth.dto';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

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
}
