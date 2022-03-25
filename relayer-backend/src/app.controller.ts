import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { HealthStatus } from './dto/HealthStatusResponse';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  getHealthStatus(): HealthStatus {
    return this.appService.getHealthStatus();
  }
}
