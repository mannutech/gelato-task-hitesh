import { Test, TestingModule } from '@nestjs/testing';
import { RelayProxyService } from './relay-proxy.service';

describe('RelayProxyService', () => {
  let service: RelayProxyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RelayProxyService],
    }).compile();

    service = module.get<RelayProxyService>(RelayProxyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
