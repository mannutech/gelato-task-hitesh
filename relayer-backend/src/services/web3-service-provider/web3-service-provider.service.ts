import { ChainId } from '@gelatonetwork/limit-orders-lib';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { SUPPORTED_CHAINID_NETWORKS } from '../../constants/index';

@Injectable()
export class Web3ServiceProvider {
  private currentProvider: ethers.providers.AlchemyProvider;
  private readonly ALCHEMY_API_KEY;

  // TOdo: Load from .env file
  private CHAINID_FUNDEDWALLET_MAP = {};

  constructor(private configService: ConfigService) {
    this.ALCHEMY_API_KEY = this.configService.get<string>('ALCHEMY_API_KEY');

    // Polygon mainnet funded account `0x7e00664398A54AE12648CAe2785c36d00dd51672
    this.CHAINID_FUNDEDWALLET_MAP[137] = this.configService.get<string>(
      'POLYGON_MAINNET_FUNDED_ACCOUNT_PRIVATE_KEY',
    );
  }

  /**
   *
   * @param chainId Network ChainId
   */
  initializeProvider(chainId: ChainId): ethers.providers.AlchemyProvider {
    if (!SUPPORTED_CHAINID_NETWORKS.includes(chainId)) {
      throw new Error(`Network ChainId: ${chainId} not supported.`);
    }

    this.currentProvider = new ethers.providers.AlchemyProvider(
      chainId,
      this.ALCHEMY_API_KEY,
    );
    return this.currentProvider;
  }

  /**
   * Gets a funded wallet account for the provider's chainId network
   */
  getFundedWallet(): ethers.Wallet {
    // Throw if no `chainId` is present in this instance
    if (!this.currentProvider?._network?.chainId) {
      throw new Error(
        'Please intialise this instance with a Web3 provider first.',
      );
    }

    const fundedWallet = new ethers.Wallet(
      this.CHAINID_FUNDEDWALLET_MAP[this.currentProvider?._network?.chainId],
      this.currentProvider,
    );

    return fundedWallet;
  }

  /**
   * Note: This function can be shifted to the `Web3ServiceProvider` Service
   * @param unsignedTx {ethers.PopulatedTransaction}
   */
  async signAndSendTx(unsignedTx: ethers.PopulatedTransaction) {
    const signer = this.getFundedWallet();

    // This method repopulates the tx, signs and broadcasts to the network
    const sentTxResponse = await signer.sendTransaction(unsignedTx);

    return sentTxResponse;
  }
}
