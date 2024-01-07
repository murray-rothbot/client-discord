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
    const { userId } = params
    const sent = this.webhooksService.sendAlertPrices(userId, alertPriceDto)

    if (sent) return { message: 'OK' }
    return { message: 'NOK' }
  }

  @Post('/alert-fee/:userId')
  sendAlertFee(@Param() params: AlertFeeRequestDto, @Body() alertFeeDto: MessageResponseDto) {
    const { userId } = params
    const sent = this.webhooksService.sendAlertFee(userId, alertFeeDto)

    if (sent) return { message: 'OK' }
    return { message: 'NOK' }
  }

  @Post('/alert-transaction/:userId')
  sendAlertTx(@Param() params: AlertTxRequestDto, @Body() alertTxDto: MessageResponseDto) {
    const { userId } = params
    const sent = this.webhooksService.sendAlertTx(userId, alertTxDto)

    if (sent) return { message: 'OK' }
    return { message: 'NOK' }
  }

  @Post('/new-fees')
  updateNewFees(@Body() feesDto: FeesBodyDto) {
    this.webhooksService.updateNewFees(feesDto)
  }

  @Post('/new-mempool')
  updateNewMempool(@Body() mempoolDto: MempoolBodyDto) {
    this.webhooksService.updateNewMempool(mempoolDto)
  }

  @Post('/new-block')
  updateNewBlock(@Body() blockDto: BlockBodyDto) {
    this.webhooksService.updateNewBlock(blockDto)
  }

  @Post('/new-price')
  updateNewPrice(@Body() priceDto: PriceBodyDto) {
    this.webhooksService.updateNewPrice(priceDto)
  }

  @Post('/op-return/:userId')
  sendOpReturn(@Param() params: MessageParamsDto, @Body() opreturnDto: MessageResponseDto) {
    const { userId } = params
    this.webhooksService.sendOpReturn(userId, opreturnDto)
  }

  @Post('/tip/:userId')
  sendTip(@Param() params: MessageParamsDto, @Body() tipDto: MessageResponseDto) {
    const { userId } = params
    this.webhooksService.sendTip(userId, tipDto)
  }
}
