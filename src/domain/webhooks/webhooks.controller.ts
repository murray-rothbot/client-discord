import { Controller, Post, Body, Param } from '@nestjs/common'
import {
  AlertFeeBodyDto,
  AlertFeeRequestDto,
  AlertPriceBodyDto,
  AlertPriceRequestDto,
  AlertTxBodyDto,
  AlertTxRequestDto,
  BlockBodyDto,
  PriceBodyDto,
  MessageParamsDto,
  MessageResponseDto,
} from './dto'
import { WebhooksService } from './webhooks.service'

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('/alert-price/:userId')
  sendAlertPrices(@Param() params: AlertPriceRequestDto, @Body() alertPriceDto: AlertPriceBodyDto) {
    const { userId } = params
    const sent = this.webhooksService.sendAlertPrices(userId, alertPriceDto)

    if (sent) return { message: 'OK' }
    return { message: 'NOK' }
  }

  @Post('/alert-fee/:userId')
  sendAlertFee(@Param() params: AlertFeeRequestDto, @Body() alertFeeDto: AlertFeeBodyDto) {
    const { userId } = params
    const sent = this.webhooksService.sendAlertFee(userId, alertFeeDto)

    if (sent) return { message: 'OK' }
    return { message: 'NOK' }
  }

  @Post('/alert-tx/:userId')
  sendAlertTx(@Param() params: AlertTxRequestDto, @Body() alertTxDto: AlertTxBodyDto) {
    const { userId } = params
    const sent = this.webhooksService.sendAlertTx(userId, alertTxDto)

    if (sent) return { message: 'OK' }
    return { message: 'NOK' }
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
