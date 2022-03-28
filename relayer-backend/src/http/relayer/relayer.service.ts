import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SUPPORTED_CHAINID_NETWORKS } from '../../constants/index';
import { RelayMetaTxDto } from './dto/RelayTxRequest';
import { RelayTxResponse, RelayTxStatus } from './dto/RelayTxResponse';
import { v4 as uuid } from 'uuid';
import { DatabaseService } from '../../services/database/database.service';
import { RelayTransactionRecord } from '../../services/database/models';
import { SendRelayTxService } from './send-relay-tx/send-relay-tx.service';

@Injectable()
export class RelayerService {
  private readonly logger = new Logger(RelayerService.name);

  constructor(
    private dbService: DatabaseService,
    private relayTxSender: SendRelayTxService,
  ) {}

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

    // Insert Incoming request to DB
    const relayRecord =
      await this.dbService.relayTransaction.insert<RelayTransactionRecord>({
        requestId,
        chainId: relayInfo.chainId,
        relayStatus: RelayTxStatus.INITIATED,
        limitOrderData: relayInfo.txData.limitOrderData,
        permitData: relayInfo.txData.daiPermitData,
      });

    this.logger.log(
      `[processRelayedTx] RequestId: ${
        relayRecord.requestId
      } successfully saved.
      Inserted record: ${JSON.stringify(relayRecord)}
      `,
    );

    this.logger.log(
      `[processRelayedTx] RequestId: ${relayRecord.requestId} Sending to RelaySender Service
      `,
    );

    this.relayTxSender.buildAndSendRelayRequest(relayRecord.requestId);

    return {
      requestId: relayRecord.requestId,
      chainId: relayRecord.chainId,
      relayStatus: relayRecord.relayStatus,
      createdAt: relayRecord.createdAt,
    };
  }

  async fetchRelayedTxInfo(requestId: string) {
    this.logger.log(
      `[fetchRelayedTxInfo] Searching for RequestId: ${requestId} `,
    );

    const record =
      await this.dbService.relayTransaction.findOne<RelayTransactionRecord>({
        requestId,
      });

    this.logger.log(
      `[fetchRelayedTxInfo] Query results: ${JSON.stringify(record)}`,
    );

    if (!record) {
      throw new NotFoundException(
        `RequestId ${requestId} not found in our records.`,
      );
    }

    return record;
  }
}
