import { ChainId } from '@gelatonetwork/limit-orders-lib';
import { RelayTxStatus } from '../../http/relayer/dto/RelayTxResponse';
import {
  CompleteLimitOrderData,
  DaiPermitData,
} from '../../http/relayer/dto/GelatoLimitOrderWithPermitSig';

export class RelayTransactionRecord {
  requestId: string;
  chainId: ChainId;
  orderCreatedHash?: string;
  gelatoOrderIdHash?: string;
  relayStatus: RelayTxStatus;
  limitOrderData: CompleteLimitOrderData;
  permitData: DaiPermitData;
  createdAt?: string;
  updatedAt?: string;
}
