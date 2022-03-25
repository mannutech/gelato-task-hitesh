import {
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { GelatoLimitOrderService } from '../gelato-limit-order/gelato-limit-order.service';
import { SUPPORTED_CHAINID_NETWORKS } from '../../constants/index';
import {
  RelayProxyService,
  GelatoLimitOrderFunctionData,
} from '../../services/relay-proxy/relay-proxy.service';
import { Web3ServiceProvider } from '../../services/web3-service-provider/web3-service-provider.service';
import { RelayMetaTxDto } from './dto/RelayTxRequest';
import { RelayTxResponse, RelayTxStatus } from './dto/RelayTxResponse';
import { v4 as uuid } from 'uuid';
import { ethers } from 'ethers';

@Injectable()
export class RelayerService {
  private readonly logger = new Logger(RelayerService.name);

  constructor(
    private gelatoLimitOrderService: GelatoLimitOrderService,
    private relayProxyService: RelayProxyService,
    private web3Service: Web3ServiceProvider,
  ) { }

  async processRelayedTx(relayInfo: RelayMetaTxDto): Promise<RelayTxResponse> {
    if (!SUPPORTED_CHAINID_NETWORKS.includes(relayInfo.chainId)) {
      this.logger.error(
        `[processRelayedTx] Chain Id: ${relayInfo.chainId} not supported.`,
      );
      throw new BadRequestException(
        `Chain Id: ${relayInfo.chainId} not supported.`,
      );
    }

    // Generate unique `requestId` for relay request tracking
    const requestId = uuid();

    this.logger.log(
      `[processRelayedTx] RequestId: ${requestId} Handling MetaTx: ${JSON.stringify(
        relayInfo.txData,
      )} | Chain Id: ${relayInfo.chainId}.`,
    );

    // Initialize Web3 Provider
    this.web3Service.initializeProvider(relayInfo.chainId);

    // Build Raw Gelato Limit Order
    this.logger.log(
      `[processRelayedTx] | RequestId: ${requestId} | Building raw limit order.`,
    );

    const limitOrderFunctionData = new GelatoLimitOrderFunctionData();
    limitOrderFunctionData._amount = relayInfo.txData.limitOrderData.amount;
    limitOrderFunctionData._data = relayInfo.txData.limitOrderData.data;
    limitOrderFunctionData._inputToken = relayInfo.txData.limitOrderData.inputToken;
    limitOrderFunctionData._module = relayInfo.txData.limitOrderData.module;
    limitOrderFunctionData._owner = relayInfo.txData.limitOrderData.owner;
    limitOrderFunctionData._secret = relayInfo.txData.limitOrderData.secret;
    limitOrderFunctionData._witness = relayInfo.txData.limitOrderData.witness;

    // Dai Permit function data
    const daiPermitDataParams = relayInfo.txData.daiPermitData;

    // Create unsigned RelayProxyV1 transaction
    this.logger.log(
      `[processRelayedTx] | RequestId: ${requestId} | Creating unsigned transaction.`,
    );
    const unsignedRelayTx = await this.relayProxyService.createUnsignedTx(
      limitOrderFunctionData,
      daiPermitDataParams,
      relayInfo.chainId,
    );

    // Sign and Broadcast the transaction with a funded relayer account
    this.logger.log(
      `[processRelayedTx] RequestId: ${requestId}  | Signing and Broadcasting the tx.`,
    );

    unsignedRelayTx.gasPrice = ethers.utils.parseUnits("50", "gwei");
    unsignedRelayTx.gasLimit = ethers.BigNumber.from(200_000);
    unsignedRelayTx.chainId = 137;

    const broadcastResult = await this.web3Service.signAndSendTx(
      unsignedRelayTx,
    );

    this.logger.log(
      `[processRelayedTx] | RequestId: ${requestId} | Broadcast results: ${JSON.stringify(
        broadcastResult,
      )}.`,
    );

    return {
      requestId,
      chainId: broadcastResult.chainId,
      txHash: broadcastResult.hash,
      relayStatus: RelayTxStatus.QUEUED,
      createdAt: new Date().toISOString(),
    };
  }
}
