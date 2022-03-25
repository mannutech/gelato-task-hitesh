import { Test, TestingModule } from '@nestjs/testing';
import { GelatoLimitOrderService } from './gelato-limit-order.service';

describe('GelatoLimitOrderService', () => {
  let service: GelatoLimitOrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GelatoLimitOrderService],
    }).compile();

    service = module.get<GelatoLimitOrderService>(GelatoLimitOrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
