import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { throwError } from 'rxjs';

@Injectable()
export class CronService {
  private readonly dkronApiUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.dkronApiUrl = this.configService.get<string>('DKRON_API_URL');
  }

  async listJobs() {
    const response = await this.httpService
      .get(`${this.dkronApiUrl}/jobs`)
      .toPromise();
    return response.data;
  }

  private async createJob(job: any) {
    //dispatch job and catch then console error
    try {
      const response = await this.httpService
        .post(`${this.dkronApiUrl}/jobs`, job)
        .toPromise();

      return response.data;
    } catch (error) {
      console.error(error);
      throwError(error);
    }
  }

  async deleteJob(quizId: string) {
    const jobNames = [
      `start_quiz_${quizId}_0`,
      `start_quiz_${quizId}_1`,
      `start_quiz_${quizId}_2`,
      `start_quiz_${quizId}_3`,
      `end_quiz_${quizId}`,
    ];

    jobNames.forEach(async (jobName) => {
      try {
        await this.httpService
          .delete(`${this.dkronApiUrl}/jobs/${jobName}`)
          .toPromise();
      } catch (error) {
        console.error(error);
        throwError(error);
      }
    });
  }

  async createStartJob(quiz_id: string, schedules: string[]) {
    const startJobCommand = `curl http://localhost:3001/start-quiz/${quiz_id}`;

    const createJobPromises: Promise<void>[] = [];

    schedules.forEach(async (time, index) => {
      const startJobName = `start_quiz_${quiz_id}_${index}`;
      const startJob = {
        name: startJobName,
        schedule: `@at ${time}`,
        owner: 'dkron',
        owner_email: `ququiz@admin.com`,
        run: {
          cmd: startJobCommand,
        },
      };

      createJobPromises.push(this.createJob(startJob));
    });

    await Promise.all(createJobPromises);
  }

  async createEndJob(quiz_id: string, end_time: string) {
    const endJobCommand = `curl http://localhost:3001/end-quiz/${quiz_id}`;
    const endJobName = `end_quiz_${quiz_id}`;
    const endJob = {
      name: endJobName,
      schedule: `@at ${end_time}`,
      owner: 'dkron',
      owner_email: `ququiz@admin.com`,
      run: {
        cmd: endJobCommand,
      },
    };

    await this.createJob(endJob);
  }

  private getScheduleForStartJob(start_time: string) {
    const startDate = new Date(start_time);
    const oneDay = 24 * 60 * 60 * 1000;
    const minute30 = 30 * 60 * 1000;
    const minute1 = 60 * 1000;

    // Calculate schedules for D-1, T-30, and T-1
    const startSchedule = startDate.toISOString();
    const day1Schedule = new Date(startDate.getTime() - oneDay).toISOString();
    const minute30Schedule = new Date(
      startDate.getTime() - minute30,
    ).toISOString();
    const minute1Schedule = new Date(
      startDate.getTime() - minute1,
    ).toISOString();

    return [startSchedule, day1Schedule, minute30Schedule, minute1Schedule];
  }
}
