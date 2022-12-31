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
import { MurrayServiceRepository } from '../repositories/murrayservice.repository'
import { NumbersService } from 'src/utils/numbers/numbers.service'

@Command({
  name: 'alert-price',
  description: 'Create an alert price.',
})
@UsePipes(TransformPipe)
@Injectable()
export class AlertPriceCommand implements DiscordTransformedCommand<AlertPriceDto> {
  constructor(
    private readonly murrayRepository: MurrayServiceRepository,
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

    const { price, currency } = dto

    const userId = interaction.user.id
    const { data } = await this.murrayRepository.createAlertPrice({
      userId,
      price,
      currency,
    })

    const currentPrice =
      data.currency === 'USD'
        ? this.numbersService.formatterUSD.format(data.currentPrice)
        : this.numbersService.formatterBRL.format(data.currentPrice)
    const side = data.above ? 'Higher or equal then:\n🔼 ' : 'Lower or equal  then\n🔽 '
    const flag = data.currency === 'USD' ? '🇺🇸' : '🇧🇷'
    const priceAlert =
      data.currency === 'USD'
        ? this.numbersService.formatterUSD.format(data.price)
        : this.numbersService.formatterBRL.format(data.price)

    const fields = response.embeds[0].fields
    fields.push({
      name: 'You will receive an alert when the price reaches',
      value: `**\n${side}${flag} ${priceAlert}\n\nCurrent Price:\n${flag} ${currentPrice}**`,
    })
    return response
  }
}
