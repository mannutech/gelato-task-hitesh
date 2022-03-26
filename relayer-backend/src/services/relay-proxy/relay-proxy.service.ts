import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Web3ServiceProvider } from '../web3-service-provider/web3-service-provider.service';
import { ethers } from 'ethers';
import { ChainId } from '@gelatonetwork/limit-orders-lib';
import { RelayProxyV1__factory } from '../../constants/typechain';

export class GelatoLimitOrderFunctionData {
  _amount: ethers.BigNumberish;
  _module: string;
  _inputToken: string;
  _owner: string;
  _witness: string;
  _data: ethers.BytesLike;
  _secret: string;
}

interface DaiPermitFunctionData {
  holder: string;
  spender: string;
  nonce: ethers.BigNumberish;
  expiry: ethers.BigNumberish;
  allowed: boolean;
  v: ethers.BigNumberish;
  r: ethers.utils.BytesLike;
  s: ethers.utils.BytesLike;
}

@Injectable()
export class RelayProxyService {
  private provider: ethers.providers.BaseProvider;
  private logger: Logger = new Logger(RelayProxyService.name);

  // Load this map at construction from some config or env
  private readonly chainIdToContractAddressMap = {
    137: {
      RelayProxyV1: '0xd3a67F512c338f63c3f81818eFD763fF8C916B73',
      ERC20OrderRouter: '0x0c2c2963A4353FfD839590f7cb1E783688378814',
      DaiToken: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
    },
  };

  /**
   *
   * @param web3ServiceProvider Autoinjected
   */
  constructor(private web3ServiceProvider: Web3ServiceProvider) {}

  /**
   * Returns the current relayer proxy contract address
   */
  getRelayerProxyContractAddress(chainId: number) {
    // Throw if network not supported
    if (!this.chainIdToContractAddressMap[chainId]) {
      throw new BadRequestException(`Network Id: ${chainId} not supported.`);
    }

    return this.chainIdToContractAddressMap[chainId]['RelayProxyV1'];
  }

  /**
   *
   * @param limitOrderData {GelatoLimitOrderFunctionData}
   * @param daiPermit {DaiPermitFunctionData}
   */
  async createUnsignedTx(
    limitOrderData: GelatoLimitOrderFunctionData,
    daiPermit: DaiPermitFunctionData,
    chainId: number,
  ): Promise<ethers.PopulatedTransaction> {
    this.logger.log(`[createUnsignedTx] Creating unsignedTx !`);

    // Fetch RelayProxyV1ContractAddress
    const relayProxyV1Address =
      this.chainIdToContractAddressMap[chainId]['RelayProxyV1'];

    // Fetch Dai Token Contract Address
    const daiTokenAddress =
      this.chainIdToContractAddressMap[chainId]['DaiToken'];

    // Fetch ERC20OrderRouter Address
    const erc20OrderRouterAddress =
      this.chainIdToContractAddressMap[chainId]['ERC20OrderRouter'];

    // Initialise the Web3 provider
    this.provider = this.web3ServiceProvider.initializeProvider(
      chainId as ChainId,
    );

    // Instantiate RelayProxy Contract
    const relayProxyContract = RelayProxyV1__factory.connect(
      relayProxyV1Address,
      this.provider,
    );

    this.logger.log(`[createUnsignedTx] 
    LimitOrderData: ${JSON.stringify(limitOrderData)}
    daiPermit: ${JSON.stringify(daiPermit)}
    daiTokenAddress: ${daiTokenAddress}
    relayProxyV1Address: ${relayProxyV1Address}
    erc20OrderRouterAddress: ${erc20OrderRouterAddress}
    `);

    // Create an unsignedTransaction
    const populatedTransaction =
      await relayProxyContract.populateTransaction.relayLimitOrderWithPermit(
        limitOrderData,
        daiPermit,
        daiTokenAddress,
        erc20OrderRouterAddress,
      );

    this.logger.log(
      `[createUnsignedTx] PopulatedTx: ${JSON.stringify(populatedTransaction)}`,
    );
    return populatedTransaction;
  }
}
