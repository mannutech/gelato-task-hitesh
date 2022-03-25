import { ChainId } from '@gelatonetwork/limit-orders-lib';
import { Type } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { GelatoLimitOrderWithPermitSigDto } from './GelatoLimitOrderWithPermitSig';

export class RelayMetaTxDto {
  @IsNotEmpty()
  chainId: ChainId;

  @Type(() => GelatoLimitOrderWithPermitSigDto)
  txData: GelatoLimitOrderWithPermitSigDto; // Keep on extending the type with other supported transactions
}
