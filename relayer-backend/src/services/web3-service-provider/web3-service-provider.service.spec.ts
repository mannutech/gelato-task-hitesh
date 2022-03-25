import { Test, TestingModule } from '@nestjs/testing';
import { Web3ServiceProvider } from './web3-service-provider.service';

describe('Web3ServiceProvider', () => {
  let service: Web3ServiceProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Web3ServiceProvider],
    }).compile();

    service = module.get<Web3ServiceProvider>(Web3ServiceProvider);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
