import { Test, TestingModule } from '@nestjs/testing';
import { RelayerController } from './relayer.controller';

describe('RelayerController', () => {
  let controller: RelayerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RelayerController],
    }).compile();

    controller = module.get<RelayerController>(RelayerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
