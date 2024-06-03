import { IsEnum } from 'class-validator';
import { QuizNotifTimeType } from 'src/helpers/enums';

export class StartQuizReqBodyDTO {
  @IsEnum(QuizNotifTimeType)
  time: QuizNotifTimeType;
}
