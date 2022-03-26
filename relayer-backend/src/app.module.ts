import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GelatoLimitOrderModule } from './http/gelato-limit-order/gelato-limit-order.module';
import { Web3ServiceProvider } from './services/web3-service-provider/web3-service-provider.service';
import { RelayProxyService } from './services/relay-proxy/relay-proxy.service';
import { RelayerController } from './http/relayer/relayer.controller';
import { RelayerService } from './http/relayer/relayer.service';
import { DatabaseService } from './services/database/database.service';
import { GelatoLimitOrderService } from './http/gelato-limit-order/gelato-limit-order.service';
import { ConfigModule } from '@nestjs/config';
import { SendRelayTxService } from './http/relayer/send-relay-tx/send-relay-tx.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [GelatoLimitOrderModule, ConfigModule.forRoot(), HttpModule],
  controllers: [AppController, RelayerController],
  providers: [
    AppService,
    Web3ServiceProvider,
    RelayProxyService,
    RelayerService,
    DatabaseService,
    GelatoLimitOrderService,
    SendRelayTxService,
  ],
})
export class AppModule {}
