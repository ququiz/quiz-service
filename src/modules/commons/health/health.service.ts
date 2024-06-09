import { Injectable } from '@nestjs/common';
import {
  HealthCheckService,
  TypeOrmHealthIndicator,
  HealthCheck,
  HealthCheckResult,
} from '@nestjs/terminus';

@Injectable()
export class HealthService {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
  ) {}

  @HealthCheck()
  checkDatabaseHealth(): Promise<HealthCheckResult> {
    return this.health.check([async () => this.db.pingCheck('database')]);
  }
}
