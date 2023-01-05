import {
  Command,
  DiscordTransformedCommand,
  TransformedCommandExecutionContext,
  Payload,
  UsePipes,
} from '@discord-nestjs/core'
import { TransformPipe } from '@discord-nestjs/common'
import { Injectable } from '@nestjs/common'
import { MyAlertPriceDTO } from '../dto'
import { NumbersService } from 'src/utils/numbers/numbers.service'
import { PricesServiceRepository } from '../repositories'

@Command({
  name: 'my-alert-price',
  description: 'List my price alerts.',
})
@UsePipes(TransformPipe)
@Injectable()
export class MyAlertPriceCommand implements DiscordTransformedCommand<MyAlertPriceDTO> {
  constructor(
    private readonly pricesServiceRepository: PricesServiceRepository,
    private readonly numbersService: NumbersService,
  ) {}

  async handler(
    @Payload() dto: MyAlertPriceDTO,
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

    const userId = interaction.user.id
    const { data: alerts } = await this.pricesServiceRepository.listAlertPrice({ userId })

    const fields = response.embeds[0].fields

    if (alerts.length == 0) {
      fields.push({
        name: 'No price alerts scheduled.',
        value: 'Use `\\alert-price` to schedule one.',
      })
    } else if (alerts.length > 1) {
      fields.push({
        name: 'You will receive an alert when the price reaches',
        value: '\u200B',
      })
    }

    for (const data of alerts) {
      const currentPrice =
        data.currency === 'USD'
          ? this.numbersService.formatterUSD.format(data.currentPrice)
          : this.numbersService.formatterBRL.format(data.currentPrice)
      const side = data.above ? '🔼 Higher or equal then' : '🔽 Lower or equal then'
      const flag = data.currency === 'USD' ? '🇺🇸' : '🇧🇷'
      const priceAlert =
        data.currency === 'USD'
          ? this.numbersService.formatterUSD.format(data.price)
          : this.numbersService.formatterBRL.format(data.price)

      if (alerts.length == 1) {
        fields.push({
          name: 'You will receive an alert when the price reaches',
          value: `**\n${side}\n${flag} ${priceAlert}\n\nCurrent Price:\n${flag} ${currentPrice}**`,
        })
      } else {
        fields.push({
          name: `${flag} ${priceAlert}`,
          value: `${side}`,
          inline: true,
        })
      }
    }

    if (alerts.length > 3 && alerts.length % 3 != 0) {
      for (let i = 0; i < 3 - (alerts.length % 3); i++) {
        fields.push({ name: `\u200B`, value: `\u200B`, inline: true })
      }
    }

    return response
  }
}
