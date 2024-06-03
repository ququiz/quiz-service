import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { throwError } from 'rxjs';

@Injectable()
export class CronService {
  private readonly dkronApiUrl: string;
  private readonly currentHost: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.dkronApiUrl = this.configService.get<string>('DKRON_API_URL');
    this.currentHost = this.configService.get<string>('HOST') || 'localhost';
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

  async deleteJob(name: string) {
    try {
      await this.httpService
        .delete(`${this.dkronApiUrl}/jobs/${name}`)
        .toPromise();
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
    const startJobCommand = `curl http://${this.currentHost}:3001/start-quiz/${quiz_id}`;

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
    const endJobCommand = `curl http://${this.currentHost}:3001/end-quiz/${quiz_id}`;
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
}
