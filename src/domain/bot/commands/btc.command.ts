import { Command, DiscordCommand, DiscordTransformedCommand } from '@discord-nestjs/core'
import { CommandInteraction } from 'discord.js'
import { Injectable } from '@nestjs/common'
import { PricesServiceRepository } from '../repositories/pricesservice.repository'
import { NumbersService } from 'src/utils/numbers/numbers.service'
import { defaultResponse } from 'src/utils/default-response'

@Command({
  name: 'btc',
  description: 'Show bitcoin fiat price',
})
@Injectable()
export class BTCCommand implements DiscordCommand {
  constructor(
    private readonly pricesRepository: PricesServiceRepository,
    private readonly numbersService: NumbersService,
  ) {}

  async handler(interaction: CommandInteraction): Promise<any> {
    const response = defaultResponse()
    const embed = response.embeds[0]
    const fields = embed.fields

    embed.title = '💵 Bitcoin Fiat Price'

    const tickers = [
      { currency: 'USD', flag: '🇺🇸' },
      { currency: 'BRL', flag: '🇧🇷' },
    ]

    for (const { currency, flag } of tickers) {
      const {
        data: { price, symbol, source, change24h },
      } = await this.pricesRepository.getTicker({
        symbol: `BTC${currency}`,
      })

      const name = `${flag} ${symbol}`
      const arrow = change24h > 0 ? '🔼' : '🔽'
      const change_str = `${(+change24h).toFixed(2)}%`

      const price_str =
        currency === 'USD'
          ? this.numbersService.formatterUSD.format(+price)
          : this.numbersService.formatterBRL.format(+price)

      fields.push({
        name,
        value: `${arrow} ${change_str}\n ${price_str}\nSource: ${source}`,
      })
    }

    return response
  }
}
