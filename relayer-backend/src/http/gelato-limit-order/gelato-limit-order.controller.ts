import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { GelatoLimitOrderService } from './gelato-limit-order.service';
import { BuildGelatoLimitOrderDto } from './dto/create-gelato-limit-order.dto';
import { ChainId } from '@gelatonetwork/limit-orders-lib';

enum OrderType {
  OPEN = 'open',
  CANCELLED = 'cancelled',
  EXECUTED = 'executed',
  PAST = 'past',
  DEFAULT = 'all',
}

@Controller('gelato-limit-order')
export class GelatoLimitOrderController {
  constructor(
    private readonly gelatoLimitOrderService: GelatoLimitOrderService,
  ) {}

  // Builds and returns the blockchain tx params for Gelato Limit Order
  @Post('build')
  async createNewOrder(
    @Body() buildGelatoLimitOrderDto: BuildGelatoLimitOrderDto,
  ) {
    return await this.gelatoLimitOrderService.buildOrderParams(
      buildGelatoLimitOrderDto,
      buildGelatoLimitOrderDto.chainId as ChainId,
    );
  }

  // Todo: SKIPPING PAGINATION SUPPORT
  @Get('order')
  fetchOrdersByType(
    @Query('chainId') chainId: number,
    @Query('owner') owner: string,
    @Query('type') orderType?: OrderType,
  ) {
    switch (orderType) {
      case OrderType.OPEN:
        return this.gelatoLimitOrderService.getAllOpenOrdersByOwner(
          owner,
          chainId,
        );
        break;

      case OrderType.EXECUTED:
        return this.gelatoLimitOrderService.getAllExecutedOrdersByOwner(
          owner,
          chainId,
        );
        break;

      case OrderType.CANCELLED:
        return this.gelatoLimitOrderService.getAllCancelledOrdersByOwner(
          owner,
          chainId,
        );
        break;

      case OrderType.PAST:
        return this.gelatoLimitOrderService.getAllPastOrdersByOwner(
          owner,
          chainId,
        );
        break;

      default:
        return this.gelatoLimitOrderService.getAllOrdersByOwner(owner, chainId);
        break;
    }
  }

  // Finds a order by OrderId
  @Get('order/:orderId')
  findOne(
    @Query('chainId') chainId: number,
    @Param('orderId') orderId: string,
  ) {
    return this.gelatoLimitOrderService.findOrderById(orderId, chainId);
  }

  @Delete(':orderId')
  cancelGelatoLimitOrder(@Param('orderId') id: string) {
    return this.gelatoLimitOrderService.cancelLimitOrder(+id);
  }
}
