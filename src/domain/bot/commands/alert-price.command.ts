import {
  Command,
  DiscordTransformedCommand,
  TransformedCommandExecutionContext,
  Payload,
  UsePipes,
} from '@discord-nestjs/core'
import { TransformPipe } from '@discord-nestjs/common'
import { Injectable } from '@nestjs/common'
import { AlertPriceDto } from '../dto/alert-price.dto'
import { NumbersService } from 'src/utils/numbers/numbers.service'
import { PricesServiceRepository } from '../repositories'

@Command({
  name: 'alert-price',
  description: 'Create an alert price.',
})
@UsePipes(TransformPipe)
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
    const response = {
      content: '',
      tts: false,
      embeds: [
        {
          type: 'rich',
          title: '',
          description: '',
          color: 0xff9900,
          timestamp: new Date(),
          fields: [],
          author: {
            name: `🗓️ Schedule Alert Price 🔔`,
            url: `https://murrayrothbot.com/`,
            icon_url: `https://murrayrothbot.com/murray-rothbot2.png`,
          },
          footer: {
            text: `Powered by Murray Rothbot`,
            icon_url: `https://murrayrothbot.com/murray-rothbot2.png`,
          },
        },
      ],
    }

    try {
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

      const fields = response.embeds[0].fields
      fields.push({
        name: '**You will receive an alert when the price reaches**',
        value: `\n\u200b\n${side}${flag} ${priceAlert}\n\n**Current Price:**\n${flag} ${currentPrice}`,
      })
    } catch (err) {
      console.error(err)

      response.embeds[0].title = 'ERROR'
      response.embeds[0].description = 'Something went wrong'
    }

    return response
  }
}
