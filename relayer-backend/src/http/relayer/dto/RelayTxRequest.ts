import { ChainId } from '@gelatonetwork/limit-orders-lib';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, ValidateNested } from 'class-validator';
import { GelatoLimitOrderWithPermitSigDto } from './GelatoLimitOrderWithPermitSig';

export class RelayMetaTxDto {
  @IsNotEmpty()
  @IsNumber()
  chainId: ChainId;

  @ValidateNested()
  @IsNotEmpty()
  @Type(() => GelatoLimitOrderWithPermitSigDto)
  txData: GelatoLimitOrderWithPermitSigDto; // Keep on extending the type with other supported transactions
}
