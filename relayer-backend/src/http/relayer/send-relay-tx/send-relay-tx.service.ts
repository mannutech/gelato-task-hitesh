import { Injectable, Logger } from '@nestjs/common';
import { GelatoLimitOrderService } from '../../gelato-limit-order/gelato-limit-order.service';
import {
  RelayProxyService,
  GelatoLimitOrderFunctionData,
} from '../../../services/relay-proxy/relay-proxy.service';
import { Web3ServiceProvider } from '../../../services/web3-service-provider/web3-service-provider.service';
import { ethers } from 'ethers';
import { DatabaseService } from '../../../services/database/database.service';
import { RelayTxStatus } from '../dto/RelayTxResponse';
import { RelayTransactionRecord } from '../../../services/database/models';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

export interface GelatoOrderSubgraphResponse {
  data: Data;
}

export interface Data {
  orders: Order[];
}

export interface Order {
  owner: string;
  inputToken: string;
  outputToken: string;
  inputAmount: string;
  minReturn: string;
  bought: null;
  status: string;
  createdTxHash: string;
  executedTxHash: null;
  cancelledTxHash: null;
}

@Injectable()
export class SendRelayTxService {
  private readonly logger = new Logger(SendRelayTxService.name);

  constructor(
    private gelatoLimitOrderService: GelatoLimitOrderService,
    private relayProxyService: RelayProxyService,
    private web3Service: Web3ServiceProvider,
    private dbService: DatabaseService,
    private httpService: HttpService,
  ) {}

  async buildAndSendRelayRequest(requestId: string) {
    this.logger.log(
      `[buildAndSendRelayRequest] Handling Relay requestId: ${requestId}`,
    );

    // Fetch Relay Request Info
    const relayRequestData: RelayTransactionRecord =
      await this.dbService.relayTransaction.findOne<RelayTransactionRecord>({
        requestId,
      });

    if (!relayRequestData) {
      this.logger.error(
        `[buildAndSendRelayRequest] Unable to find any Relay request with id: ${requestId}`,
      );
      return;
    }

    // Initialize Web3 Provider
    this.web3Service.initializeProvider(relayRequestData.chainId);

    // Build Raw Gelato Limit Order
    const limitOrderFunctionData = new GelatoLimitOrderFunctionData();
    limitOrderFunctionData._amount = relayRequestData.limitOrderData.amount;
    limitOrderFunctionData._data = relayRequestData.limitOrderData.data;
    limitOrderFunctionData._inputToken =
      relayRequestData.limitOrderData.inputToken;
    limitOrderFunctionData._module = relayRequestData.limitOrderData.module;
    limitOrderFunctionData._owner = relayRequestData.limitOrderData.owner;
    limitOrderFunctionData._secret = relayRequestData.limitOrderData.secret;
    limitOrderFunctionData._witness = relayRequestData.limitOrderData.witness;

    // Dai Permit function data
    const daiPermitDataParams = relayRequestData.permitData;

    // Create unsigned RelayProxyV1 transaction
    this.logger.log(
      `[buildAndSendRelayRequest] | RequestId: ${relayRequestData.requestId} | Creating unsigned transaction.`,
    );
    const unsignedRelayTx = await this.relayProxyService.createUnsignedTx(
      limitOrderFunctionData,
      daiPermitDataParams,
      relayRequestData.chainId,
    );

    // Sign and Broadcast the transaction with a funded relayer account
    this.logger.log(
      `[buildAndSendRelayRequest] | RequestId: ${relayRequestData.requestId} | Signing and Broadcasting the tx.`,
    );

    // Manually overriding for Polygon Mainnet
    unsignedRelayTx.gasPrice = ethers.utils.parseUnits('50', 'gwei');

    // Manually overriding GasLimit for Polygon Mainnet
    unsignedRelayTx.gasLimit = ethers.BigNumber.from(200_000);

    // Manually setting chainId
    unsignedRelayTx.chainId = relayRequestData.chainId;

    const broadcastResult = await this.web3Service.signAndSendTx(
      unsignedRelayTx,
    );

    this.logger.log(
      `[buildAndSendRelayRequest] | RequestId: ${relayRequestData.requestId} | Broadcasted successfully: ${broadcastResult.hash}.`,
    );

    // Mark the record as QUEUED in our database
    const updateResults =
      await this.dbService.relayTransaction.update<RelayTransactionRecord>(
        {
          requestId: relayRequestData.requestId,
          relayStatus: RelayTxStatus.INITIATED,
        },
        {
          $set: {
            orderCreatedHash: broadcastResult.hash,
            relayStatus: RelayTxStatus.QUEUED,
          },
        },
      );

    this.logger.log(
      `[buildAndSendRelayRequest] | RequestId: ${
        relayRequestData.requestId
      } | Updated as '${
        RelayTxStatus.QUEUED
      }' successfully. | New record: ${JSON.stringify(updateResults)}`,
    );

    this.logger.log(
      `Waiting for 3 Block confirmations before checking Subgraphs.`,
    );

    // Asynchronously Wait for Tx Receipt
    broadcastResult
      .wait(3) // Todo: Better add some retrying mechanism to check for pending orders
      .then((receipt) => {
        this.logger.log(
          `[buildAndSendRelayRequest] | RequestId: ${relayRequestData.requestId} | Blockchain Transaction Receipt: ${receipt.transactionHash}. | Status: ${receipt.status} | Block Number: ${receipt.blockNumber}`,
        );

        if (receipt.status) {
          this.logger.log(
            `[buildAndSendRelayRequest] | RequestId: ${relayRequestData.requestId} | Checking subgraph for the order.`,
          );

          // Check the subgraph for new orders
          this.checkGelatoSubgraphForCreatedTxHash(
            receipt.transactionHash,
            relayRequestData.requestId,
          );
        }
      })
      .catch(async (error) => {
        this.logger.error(error, error.stack);

        // Mark the record as REJECTED in our database
        await this.dbService.relayTransaction.update<RelayTransactionRecord>(
          {
            requestId: requestId,
            relayStatus: RelayTxStatus.QUEUED,
            orderCreatedHash: broadcastResult.hash,
          },
          {
            $set: {
              relayStatus: RelayTxStatus.REJECTED,
            },
          },
          {
            multi: false,
          },
        );

        this.logger.log(
          `[buildAndSendRelayRequest] | RequestId: ${relayRequestData.requestId} |
             Marked relay request as '${RelayTxStatus.REJECTED}'.`,
        );
      });
  }

  async checkGelatoSubgraphForCreatedTxHash(txHash: string, requestId: string) {
    const data = JSON.stringify({
      query: `query ($createdTxHash: String!){
              orders(where: {createdTxHash: $createdTxHash}) {
                id
                owner
                inputToken
                outputToken
                inputAmount
                minReturn
                bought
                status
                createdTxHash
                executedTxHash
                cancelledTxHash
              }
            }`,
      variables: { createdTxHash: txHash },
    });

    const graphRequest = await lastValueFrom(
      this.httpService.request<GelatoOrderSubgraphResponse>({
        method: 'post',
        url: 'https://api.thegraph.com/subgraphs/name/gelatodigital/limit-orders-polygon-ii', // Todo: Refactor to a constant in .env
        headers: {
          'Content-Type': 'application/json',
        },
        data: data,
      }),
    );

    this.logger.log(
      `[checkGelatoSubgraphForCreatedTxHash] RequestId: ${requestId} | Subgraph Query Result: ${JSON.stringify(
        graphRequest.data,
      )}`,
    );

    if (graphRequest && graphRequest.data.data.orders.length == 1) {
      // Todo: Mark relay record as `RelayRcorStatus.Processed` .
      // Mark the record as QUEUED in our database
      await this.dbService.relayTransaction.update<RelayTransactionRecord>(
        {
          requestId: requestId,
          relayStatus: RelayTxStatus.QUEUED,
          orderCreatedHash: txHash,
        },
        {
          $set: {
            onChainOrderDetails: graphRequest.data.data.orders[0],
            relayStatus: RelayTxStatus.PROCESSED,
          },
        },
        {
          multi: false,
        },
      );
    } else {
      this.logger.log(
        `[checkGelatoSubgraphForCreatedTxHash] RequestId: ${requestId} | No Order Found on Subgraph must retry later: ${JSON.stringify(
          graphRequest.data,
        )}`,
      );
    }
  }
}
