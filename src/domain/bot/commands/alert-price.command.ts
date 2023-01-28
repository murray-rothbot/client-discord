import {
  Command,
  DiscordTransformedCommand,
  TransformedCommandExecutionContext,
  Payload,
  UsePipes,
} from '@discord-nestjs/core'
import { TransformPipe, ValidationPipe } from '@discord-nestjs/common'
import { Injectable } from '@nestjs/common'
import { AlertPriceDto } from '../dto/alert-price.dto'
import { NumbersService } from 'src/utils/numbers/numbers.service'
import { PricesServiceRepository } from '../repositories'
import { defaultResponse } from 'src/utils/default-response'

@Command({
  name: 'alert-price',
  description: 'Create an alert price.',
})
@UsePipes(TransformPipe, ValidationPipe)
@Injectable()
export class AlertPriceCommand implements DiscordTransformedCommand<AlertPriceDto> {
  constructor(
    private readonly pricesServiceRepository: PricesServiceRepository,
    private readonly numbersService: NumbersService,
  ) {}

  async handler(
    @Payload() dto: AlertPriceDto,
    { interaction }: TransformedCommandExecutionContext,
  ): Promise<any> {
    const response = defaultResponse()
    const embed = response.embeds[0]
    const fields = embed.fields

    embed.title = '🗓️ Schedule Alert Price'

    const { price, currency } = dto

    const userId = interaction.user.id
    const { data } = await this.pricesServiceRepository.createAlertPrice({
      userId,
      price,
      currency,
    })

    const currentPrice =
      data.currency === 'USD'
        ? this.numbersService.formatterUSD.format(data.currentPrice)
        : this.numbersService.formatterBRL.format(data.currentPrice)
    const side = data.above ? '**Higher or equal then:**\n📈 ' : '**Lower or equal then:**\n📉 '
    const flag = data.currency === 'USD' ? '🇺🇸' : '🇧🇷'
    const priceAlert =
      data.currency === 'USD'
        ? this.numbersService.formatterUSD.format(data.price)
        : this.numbersService.formatterBRL.format(data.price)

    fields.push({
      name: '**You will receive an alert when the price reaches**',
      value: `\n\u200b\n${side}${flag} ${priceAlert}\n\n**Current Price:**\n${flag} ${currentPrice}`,
    })

    return response
  }
}
