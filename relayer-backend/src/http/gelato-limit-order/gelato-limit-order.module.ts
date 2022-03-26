import { Module } from '@nestjs/common';
import { GelatoLimitOrderService } from './gelato-limit-order.service';
import { GelatoLimitOrderController } from './gelato-limit-order.controller';
import { Web3ServiceProvider } from '../../services/web3-service-provider/web3-service-provider.service';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [GelatoLimitOrderController],
  providers: [GelatoLimitOrderService, Web3ServiceProvider, ConfigService],
})
export class GelatoLimitOrderModule {}
