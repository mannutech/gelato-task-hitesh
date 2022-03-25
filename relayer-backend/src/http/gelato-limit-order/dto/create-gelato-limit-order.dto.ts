import { IsNumber } from 'class-validator';
import { CreateLimitOrderData } from '../../relayer/dto/GelatoLimitOrderWithPermitSig';

export class BuildGelatoLimitOrderDto extends CreateLimitOrderData {
  @IsNumber()
  chainId: number;
}
