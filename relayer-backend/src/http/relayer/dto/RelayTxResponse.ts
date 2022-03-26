export enum RelayTxStatus {
  // Accepted by the Relayer backend, but not yet sent
  INITIATED = 'initiated',

  // Accepted by the ERC20OrderRouter on the blockchain
  QUEUED = 'queued',

  // Rejected by the Relayer backend due to processing errors
  REJECTED = 'rejected',

  // Transaction relayed successfully on blockchain
  PROCESSED = 'processed',

  // Relay request cancelled by the user
  CANCELLED = 'cancelled',
}

export class RelayTxResponse {
  requestId: string;
  chainId: number;
  txHash?: string;
  relayStatus: RelayTxStatus;
  createdAt: string;
}
