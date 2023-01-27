import { Command, DiscordCommand } from '@discord-nestjs/core'
import { Injectable } from '@nestjs/common'
import { NumbersService } from 'src/utils/numbers/numbers.service'
import { PricesServiceRepository } from '../repositories'
import { defaultResponse } from 'src/utils/default-response'
import { CommandInteraction } from 'discord.js'

@Command({
  name: 'my-alert-price',
  description: 'List my price alerts.',
})
@Injectable()
export class MyAlertPriceCommand implements DiscordCommand {
  constructor(
    private readonly pricesServiceRepository: PricesServiceRepository,
    private readonly numbersService: NumbersService,
  ) {}

  async handler(interaction: CommandInteraction): Promise<any> {
    const response = defaultResponse()
    const embed = response.embeds[0]
    const fields = embed.fields

    embed.title = '🗓️ Schedule Alert Prices'

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
      embed.description = `${currentPriceDescription.join('')}\n${description.join('')}`
    }

    return response
  }
}
