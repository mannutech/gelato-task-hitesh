import { Injectable } from '@nestjs/common';
import { HealthStatus } from './dto/HealthStatusResponse';

@Injectable()
export class AppService {
  getHealthStatus(): HealthStatus {
    return { status: 'ok' };
  }
}
