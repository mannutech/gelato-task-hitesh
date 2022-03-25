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

@Module({
  imports: [GelatoLimitOrderModule, ConfigModule.forRoot()],
  controllers: [AppController, RelayerController],
  providers: [
    AppService,
    Web3ServiceProvider,
    RelayProxyService,
    RelayerService,
    DatabaseService,
    GelatoLimitOrderService
  ],
})
export class AppModule { }
