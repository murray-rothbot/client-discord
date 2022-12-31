import { Controller, Post, Body, Param } from '@nestjs/common'
import { AlertPriceBodyDto, AlertPriceRequestDto } from './dto'
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
}
