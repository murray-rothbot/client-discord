import { Controller, Post, Body, Param } from '@nestjs/common'
import {
  AlertFeeRequestDto,
  AlertPriceRequestDto,
  AlertTxRequestDto,
  BlockBodyDto,
  PriceBodyDto,
  MessageParamsDto,
  MessageResponseDto,
  FeesBodyDto,
  MempoolBodyDto,
} from './dto'
import { WebhooksService } from './webhooks.service'

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('/alert-price/:userId')
  sendAlertPrices(
    @Param() params: AlertPriceRequestDto,
    @Body() alertPriceDto: MessageResponseDto,
  ) {
    try {
      const { userId } = params
      const sent = this.webhooksService.sendAlertPrices(userId, alertPriceDto)

      if (sent) return { message: 'OK' }
      return { message: 'NOK' }
    } catch (error) {
      return { message: 'NOK' }
    }
  }

  @Post('/alert-fee/:userId')
  sendAlertFee(@Param() params: AlertFeeRequestDto, @Body() alertFeeDto: MessageResponseDto) {
    try {
      const { userId } = params
      const sent = this.webhooksService.sendAlertFee(userId, alertFeeDto)

      if (sent) return { message: 'OK' }
      return { message: 'NOK' }
    } catch (error) {
      return { message: 'NOK' }
    }
  }

  @Post('/alert-transaction/:userId')
  sendAlertTx(@Param() params: AlertTxRequestDto, @Body() alertTxDto: MessageResponseDto) {
    try {
      const { userId } = params
      const sent = this.webhooksService.sendAlertTx(userId, alertTxDto)

      if (sent) return { message: 'OK' }
      return { message: 'NOK' }
    } catch (error) {
      return { message: 'NOK' }
    }
  }

  @Post('/new-fees')
  updateNewFees(@Body() feesDto: FeesBodyDto) {
    try {
      this.webhooksService.updateNewFees(feesDto)
    } catch (error) {
      console.log(error)
    }
  }

  @Post('/new-mempool')
  updateNewMempool(@Body() mempoolDto: MempoolBodyDto) {
    try {
      this.webhooksService.updateNewMempool(mempoolDto)
    } catch (error) {
      console.log(error)
    }
  }

  @Post('/new-block')
  updateNewBlock(@Body() blockDto: BlockBodyDto) {
    try {
      this.webhooksService.updateNewBlock(blockDto)
    } catch (error) {
      console.log(error)
    }
  }

  @Post('/new-price')
  updateNewPrice(@Body() priceDto: PriceBodyDto) {
    try {
      this.webhooksService.updateNewPrice(priceDto)
    } catch (error) {
      console.log(error)
    }
  }

  @Post('/op-return/:userId')
  sendOpReturn(@Param() params: MessageParamsDto, @Body() opreturnDto: MessageResponseDto) {
    try {
      const { userId } = params
      this.webhooksService.sendOpReturn(userId, opreturnDto)
    } catch (error) {
      console.log(error)
    }
  }

  @Post('/tip/:userId')
  sendTip(@Param() params: MessageParamsDto, @Body() tipDto: MessageResponseDto) {
    try {
      const { userId } = params
      this.webhooksService.sendTip(userId, tipDto)
    } catch (error) {
      console.log(error)
    }
  }
}
