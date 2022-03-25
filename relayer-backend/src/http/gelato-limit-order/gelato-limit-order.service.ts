import { ChainId, GelatoLimitOrders } from '@gelatonetwork/limit-orders-lib';
import { Injectable, Logger } from '@nestjs/common';
import { ethers } from 'ethers';
import { CreateLimitOrderData } from '../relayer/dto/GelatoLimitOrderWithPermitSig';
import { getERC20OrderRouterContractInterface } from './utils/txUtils';
import { Web3ServiceProvider } from '../../services/web3-service-provider/web3-service-provider.service';

@Injectable()
export class GelatoLimitOrderService {
  private logger = new Logger(GelatoLimitOrderService.name);

  constructor(private web3ServiceProvider: Web3ServiceProvider) { }


  /**
   * * Builds blockchain params for the Gelato Limit Order order
   * @param limitOrderData {CreateLimitOrderData}
   * @param chainId {string|number}
   */
  async buildOrderParams(
    limitOrderData: CreateLimitOrderData,
    chainId: ChainId,
  ) {
    this.logger.log(`Building Gelator Limit Order: ${chainId} | Data: ${JSON.stringify(limitOrderData)}`)

    // Initialise Web3 Provider
    const provider = this.web3ServiceProvider.initializeProvider(chainId);

    const gelatoLimitOrders = new GelatoLimitOrders(chainId as ChainId, provider);

    const encodedTxData = await gelatoLimitOrders.encodeLimitOrderSubmission(
      limitOrderData.inputTokenAddress,
      limitOrderData.outputTokenAddress,
      ethers.utils.parseUnits(limitOrderData.inputAmount, "wei"),
      ethers.utils.parseUnits(limitOrderData.minimumReturn, "wei"),
      limitOrderData.fromAddress,
    );

    this.logger.log(`Encoded TxData: ${JSON.stringify(encodedTxData)}`);

    const contractInterface = getERC20OrderRouterContractInterface();

    const decodedFunctionData = contractInterface.decodeFunctionData(
      'depositToken',
      encodedTxData.data,
    );

    return {
      amount: decodedFunctionData._amount.toString(),
      module: decodedFunctionData._module,
      inputToken: decodedFunctionData._inputToken,
      owner: decodedFunctionData._owner,
      witness: decodedFunctionData._witness,
      data: decodedFunctionData._data,
      secret: decodedFunctionData._secret,
    };
  }

  /**
   * * Fetch ALL orders by Wallet address
   * @param ownerAddress
   * @param chainId
   */
  async getAllOrdersByOwner(ownerAddress: string, chainId: number) {
    const gelatoLimitOrders = new GelatoLimitOrders(chainId as ChainId);

    // Return all gelato orders for an owner address (including `null` )
    return await gelatoLimitOrders.getOrders(ownerAddress, true);
  }

  /**
   * * Fetch all OPEN orders by Wallet address
   * @param ownerAddress
   * @param chainId
   */
  async getAllOpenOrdersByOwner(ownerAddress: string, chainId: number) {
    const gelatoLimitOrders = new GelatoLimitOrders(chainId as ChainId);

    // Return all gelato open orders (including `null` )
    return await gelatoLimitOrders.getOpenOrders(ownerAddress, true);
  }

  /**
   * * Fetch a particular order by Id
   * @param chainId
   * @param orderId
   */
  async findOrderById(orderId: string, chainId: number) {
    const gelatoLimitOrders = new GelatoLimitOrders(chainId as ChainId);

    // Return gelato open orders (including `null` )

    const order = await gelatoLimitOrders.getOrder(orderId);
    return order;
  }

  /**
   * * Fetch all CANCELLED orders by Wallet address
   * @param chainId
   * @param owner
   */
  async getAllCancelledOrdersByOwner(owner: string, chainId: number) {
    const gelatoLimitOrders = new GelatoLimitOrders(chainId as ChainId);

    // Return gelato Cancelled orders (including `null` )
    const orderList = await gelatoLimitOrders.getCancelledOrders(owner, true);
    return orderList;
  }

  /**
   * Fetch all PAST orders by Wallet address
   * @param chainId
   * @param owner
   */
  async getAllPastOrdersByOwner(owner: string, chainId: number) {
    const gelatoLimitOrders = new GelatoLimitOrders(chainId as ChainId);

    // Return gelato Past orders (including `null` )
    const orderList = await gelatoLimitOrders.getPastOrders(owner, true);
    return orderList;
  }

  /**
   * Fetch all EXECUTED orders by Wallet address
   * @param chainId
   * @param owner
   */
  async getAllExecutedOrdersByOwner(owner: string, chainId: number) {
    const gelatoLimitOrders = new GelatoLimitOrders(chainId as ChainId);

    // Return gelato Past orders (including `null` )
    const orderList = await gelatoLimitOrders.getExecutedOrders(owner, true);
    return orderList;
  }

  // Todo: Skipping in phase 1
  cancelLimitOrder(orderId: number) {
    return `This action cancel a #${orderId} gelatoLimitOrder`;
  }
}
