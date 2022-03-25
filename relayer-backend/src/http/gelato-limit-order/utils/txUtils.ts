import { ERC20OrderRouter__factory } from '@gelatonetwork/limit-orders-lib/dist/contracts/types';

export const getERC20OrderRouterContractInterface = () => {
  return ERC20OrderRouter__factory.createInterface();
};
