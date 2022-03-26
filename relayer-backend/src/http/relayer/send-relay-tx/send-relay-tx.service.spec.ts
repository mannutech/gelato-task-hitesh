import { Test, TestingModule } from '@nestjs/testing';
import { SendRelayTxService } from './send-relay-tx.service';

describe('SendRelayTxService', () => {
  let service: SendRelayTxService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SendRelayTxService],
    }).compile();

    service = module.get<SendRelayTxService>(SendRelayTxService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
