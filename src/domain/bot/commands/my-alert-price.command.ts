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

    try {
      // get prices
      const { data: lastPriceBRL } = await this.pricesServiceRepository.getTicker({
        symbol: 'BTCBRL',
      })
      const { data: lastPriceUSD } = await this.pricesServiceRepository.getTicker({
        symbol: 'BTCUSD',
      })

      const lastPriceBRLFormatted = this.numbersService.formatterBRL.format(lastPriceBRL.price)
      const lastPriceUSDFormatted = this.numbersService.formatterUSD.format(lastPriceUSD.price)
      const currentPriceDescription = []
      currentPriceDescription.push(`**Current price of Bitcoin**\n`)

      const userId = interaction.user.id
      const { data: alerts } = await this.pricesServiceRepository.listAlertPrice({ userId })

      const description = []
      const fields = response.embeds[0].fields

      if (alerts.length == 0) {
        fields.push({
          name: 'No price alerts scheduled.',
          value: 'Use `/alert-price` to schedule one.',
        })
      } else if (alerts.length > 1) {
        description.push(`**You will receive an alert when the price reaches**\n`)
      }

      let showCurrentPriceUSD = false
      let showCurrentPriceBRL = false
      for (const data of alerts) {
        const currentPrice =
          data.currency === 'USD'
            ? this.numbersService.formatterUSD.format(data.currentPrice)
            : this.numbersService.formatterBRL.format(data.currentPrice)
        const side = data.above ? '📈' : '📉'
        const flag = data.currency === 'USD' ? '🇺🇸' : '🇧🇷'
        const priceAlert =
          data.currency === 'USD'
            ? this.numbersService.formatterUSD.format(data.price)
            : this.numbersService.formatterBRL.format(data.price)

        if (alerts.length == 1) {
          fields.push({
            name: 'You will receive an alert when the price reaches',
            value: `**\n${side} ${flag} ${priceAlert}\n\nCurrent Price:\n${flag} ${currentPrice}**`,
          })
        } else {
          if (data.currency === 'USD') {
            showCurrentPriceUSD = true
          }
          if (data.currency === 'BRL') {
            showCurrentPriceBRL = true
          }
          description.push(`${side} ${flag} ${priceAlert}\n`)
        }
      }
      if (showCurrentPriceUSD) {
        currentPriceDescription.push(`🇺🇸 ${lastPriceUSDFormatted}\n`)
      }
      if (showCurrentPriceBRL) {
        currentPriceDescription.push(`🇧🇷 ${lastPriceBRLFormatted}\n`)
      }

      if (alerts.length > 1) {
        response.embeds[0].description = `${currentPriceDescription.join('')}\n${description.join(
          '',
        )}`
      }
    } catch (err) {
      console.error(err)

      response.embeds[0].title = 'ERROR'
      response.embeds[0].description = 'Something went wrong'
    }

    return response
  }
}
