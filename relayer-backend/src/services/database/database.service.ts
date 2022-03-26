import { Injectable } from '@nestjs/common';
import DataStore from 'nedb-promises';
import { RelayTransactionRecord } from './models';

@Injectable()
export class DatabaseService {
  public relayTransaction: DataStore<RelayTransactionRecord>;

  constructor() {
    this.loadRelayTransactionRecord();
  }

  private loadRelayTransactionRecord() {
    this.relayTransaction = DataStore.create({
      filename: `relayRequestStore.db`,
      timestampData: true,
      autoload: true
    });
  }
}
