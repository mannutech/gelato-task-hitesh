import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { RelayProxyService } from '../../services/relay-proxy/relay-proxy.service';
import { RelayerService } from './relayer.service';
import { RelayMetaTxDto } from './dto/RelayTxRequest';
import { RelayTxResponse } from './dto/RelayTxResponse';

@Controller('relayer')
export class RelayerController {
  constructor(
    private relayerService: RelayerService,
    private relayProxyService: RelayProxyService,
  ) { }

  @Get('contractAddress')
  getRelayerContractAddress(@Query('chainId') chainId: number) {
    return { contractAddress: this.relayProxyService.getRelayerProxyContractAddress(chainId) };
  }

  @Post('newTx')
  handleTxToBeRelayed(
    @Body() metaTx: RelayMetaTxDto,
  ): Promise<RelayTxResponse> {
    return this.relayerService.processRelayedTx(metaTx);
  }
}
