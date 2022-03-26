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
      autoload: true,
      inMemoryOnly: true,
      timestampData: true,
    });
  }
}
