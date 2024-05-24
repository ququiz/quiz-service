import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { QuestionType } from 'src/modules/datasources/entities/questions.entity';

export class CreateQuizReqBodyDTO {
  @IsString()
  title: string;

  @IsArray()
  @Type(() => CreateQuizQuestionDTO)
  @ValidateNested({ each: true })
  questions: CreateQuizQuestionDTO[];

  @IsDate()
  @Type(() => Date)
  start_time: Date;

  @IsDate()
  @Type(() => Date)
  end_time: Date;
}

export class CreateQuizQuestionDTO {
  @IsString()
  question: string;

  @IsEnum(QuestionType)
  type: QuestionType;

  @ValidateIf((o) => o.type === QuestionType.Multiple)
  @IsArray()
  @Type(() => CreateQuizQuestionChoiceDTO)
  @ValidateNested({ each: true })
  choices?: CreateQuizQuestionChoiceDTO[];

  @IsOptional()
  @IsString()
  essay_answer?: string;

  @IsNumber()
  weight: number;
}

export class CreateQuizQuestionChoiceDTO {
  @IsString()
  text: string;

  @IsOptional()
  @IsBoolean()
  is_correct?: boolean;
}

export class UpdateQuizDTO {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsArray()
  @Type(() => CreateQuizQuestionDTO)
  @ValidateNested({ each: true })
  questions?: CreateQuizQuestionDTO[];

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  start_time?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  end_time?: Date;
}

export class AddQuizParticipantDTO {
  @IsString()
  participant_id: string;
}

export class CreateQuizResDTO {
  created_quiz: {
    id: string;
  };
}

export class AddQuizParticipantResDTO {
  message: string;
}
