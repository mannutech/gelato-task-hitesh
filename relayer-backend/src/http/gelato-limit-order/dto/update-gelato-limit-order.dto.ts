import { PartialType } from '@nestjs/mapped-types';
import { BuildGelatoLimitOrderDto } from './create-gelato-limit-order.dto';

export class UpdateGelatoLimitOrderDto extends PartialType(
  BuildGelatoLimitOrderDto,
) {}
