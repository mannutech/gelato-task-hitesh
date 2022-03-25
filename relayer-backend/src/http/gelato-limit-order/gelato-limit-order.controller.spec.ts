import { Test, TestingModule } from '@nestjs/testing';
import { GelatoLimitOrderController } from './gelato-limit-order.controller';
import { GelatoLimitOrderService } from './gelato-limit-order.service';

describe('GelatoLimitOrderController', () => {
  let controller: GelatoLimitOrderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GelatoLimitOrderController],
      providers: [GelatoLimitOrderService],
    }).compile();

    controller = module.get<GelatoLimitOrderController>(
      GelatoLimitOrderController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
