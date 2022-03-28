import { ChainId } from '@gelatonetwork/limit-orders-lib';
import { RelayTxStatus } from '../../http/relayer/dto/RelayTxResponse';
import {
  CompleteLimitOrderData,
  DaiPermitData,
} from '../../http/relayer/dto/GelatoLimitOrderWithPermitSig';

export interface GelatoOnChainOrder {
  id: string;
  owner: string;
  inputToken: string;
  outputToken: string;
  inputAmount: string;
  minReturn: string;
  bought?: any;
  status: string;
  createdTxHash: string;
  executedTxHash?: string;
  cancelledTxHash?: string;
}

export class RelayTransactionRecord {
  requestId: string;
  chainId: ChainId;
  orderCreatedHash?: string;
  onChainOrderDetails?: GelatoOnChainOrder;
  relayStatus: RelayTxStatus;
  limitOrderData: CompleteLimitOrderData;
  permitData: DaiPermitData;
  createdAt?: string;
  updatedAt?: string;
}
