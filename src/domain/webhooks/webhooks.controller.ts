import { Controller, Post, Body } from '@nestjs/common'
import { IAlertPrice } from './interfaces'
import { WebhooksService } from './webhooks.service'

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('/alert-prices')
  sendAlertPrices(@Body() alertPricesDto: IAlertPrice[]) {
    const sent = this.webhooksService.sendAlertPrices(alertPricesDto)

    if (sent) return { message: 'OK' }
    return { message: 'NOK' }
  }
}
