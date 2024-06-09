import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';
import { HealthCheckResult } from '@nestjs/terminus';
import { SuccessResponse } from 'src/helpers/interfaces';

@Controller()
export class HealthController {
  constructor(private healthService: HealthService) {}

  @Get('healthz')
  public async check(): Promise<SuccessResponse<HealthCheckResult>> {
    const result = await this.healthService.checkDatabaseHealth();

    return {
      data: result,
      message: 'Health check completed',
    };
  }
}
