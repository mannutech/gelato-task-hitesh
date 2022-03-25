import { IsBoolean, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

// This is user provided order data which needs completion
export class CreateLimitOrderData {
  @IsString()
  fromAddress: string;

  @IsString()
  inputTokenAddress: string;

  @IsString()
  outputTokenAddress: string;

  @IsString()
  inputAmount: string;

  @IsString()
  minimumReturn: string;
}

// This contains sufficient information to place a Gelato Order on Chain
export class CompleteLimitOrderData {
  @IsString()
  amount: string;

  @IsString()
  module: string;

  @IsString()
  owner: string;

  @IsString()
  witness: string;

  @IsString()
  data: string;

  @IsString()
  secret: string;

  @IsString()
  inputToken: string;
}

export class DaiPermitData {
  @IsString()
  holder: string;

  @IsString()
  spender: string;

  @IsNumber()
  nonce: number;

  @IsNumber()
  expiry: number;

  @IsBoolean()
  allowed: boolean;

  @IsNumber()
  v: number;

  @IsString()
  r: string;

  @IsString()
  s: string;
}

export class GelatoLimitOrderWithPermitSigDto {
  @Type(() => CompleteLimitOrderData)
  limitOrderData: CompleteLimitOrderData;

  @Type(() => DaiPermitData)
  daiPermitData: DaiPermitData;
}
