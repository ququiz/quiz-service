import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { QuizNotifTimeType } from 'src/helpers/enums';

@Injectable()
export class CronService {
  private readonly dkronApiUrl: string;
  private readonly serviceUrl: string;
  private readonly scoringServiceUrl: string;
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.dkronApiUrl = this.configService.get<string>('DKRON_API_URL');
    this.serviceUrl =
      this.configService.get<string>('QUIZ_SERVICE_URL') ||
      'http://localhost:3000';
    this.scoringServiceUrl =
      this.configService.get<string>('SCORING_SERVICE_URL') ||
      'http://localhost:3504';
  }

  async listJobs() {
    const response = await lastValueFrom(
      this.httpService.get(`${this.dkronApiUrl}/jobs`),
    );
    return response.data;
  }

  private async createJob(job: any) {
    //dispatch job and catch then console error
    try {
      const response = await lastValueFrom(
        this.httpService.post(`${this.dkronApiUrl}/jobs`, job),
      );

      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async deleteJob(name: string) {
    try {
      await lastValueFrom(
        this.httpService.delete(`${this.dkronApiUrl}/jobs/${name}`),
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async deleteAllJobs(quiz_id: string) {
    const jobs = await this.listJobs();
    const deleteJobPromises: Promise<void>[] = [];

    jobs.forEach((job: any) => {
      if (job.name.includes(quiz_id)) {
        deleteJobPromises.push(this.deleteJob(job.name));
      }
    });

    await Promise.all(deleteJobPromises);
  }

  async createStartJob(quiz_id: string, schedules: string[]) {
    const types = [
      QuizNotifTimeType.T1,
      QuizNotifTimeType.T30,
      QuizNotifTimeType.D1,
    ];

    const startJobCommand = `curl ${this.serviceUrl}/quiz-internal/${quiz_id}/start -X POST -H "Content-Type: application/json"`;

    const createJobPromises: Promise<void>[] = [];

    schedules.forEach(async (time, index) => {
      const startJobName = `start_quiz_${quiz_id}_${index}`;
      const startJob = {
        name: startJobName,
        schedule: `@at ${time}`,
        timezone: 'Asia/Jakarta',
        displayname: `Start Quiz Scheduler ${quiz_id} for Time: ${types[index]}`,
        owner: 'dkron',
        owner_email: `ququiz@admin.com`,
        disabled: false,
        concurrency: 'allow',
        executor: 'shell',
        executor_config: {
          command: startJobCommand + ` -d '{"time":  "${types[index]}"}'`,
        },
      };

      createJobPromises.push(this.createJob(startJob));
    });

    await Promise.all(createJobPromises);
  }

  async createEndJob(quiz_id: string, end_time: string) {
    const endJobCommand = `curl -XPOST ${this.scoringServiceUrl}/scoring-internal/recap/${quiz_id}`;
    const endJobName = `end_quiz_${quiz_id}`;
    const endJob = {
      name: endJobName,
      schedule: `@at ${end_time}`,
      timezone: 'Asia/Jakarta',
      displayname: `End Quiz ${quiz_id}`,
      owner: 'dkron',
      owner_email: `ququiz@admin.com`,
      disabled: false,
      concurrency: 'allow',
      executor: 'shell',
      executor_config: {
        command: endJobCommand,
      },
    };

    await this.createJob(endJob);
  }
}
