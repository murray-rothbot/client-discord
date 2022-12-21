import { Command, DiscordCommand } from '@discord-nestjs/core'
import { CommandInteraction, EmbedBuilder } from 'discord.js'
import { Injectable } from '@nestjs/common'
import { PricesServiceRepository } from '../repositories/pricesservice.repository'

@Command({
  name: 'btc',
  description: 'Show bitcoin fiat price',
})
@Injectable()
export class BTCCommand implements DiscordCommand {
  constructor(private readonly pricesRepository: PricesServiceRepository) {}

  async handler(interaction: CommandInteraction): Promise<any> {
    const response = {
      content: '',
      tts: false,
      embeds: [
        {
          type: 'rich',
          title: '',
          description: '',
          color: 0xff9900,
          fields: [],
          thumbnail: {
            url: `https://murrayrothbot.com/murray-rothbot2.png`,
            height: 0,
            width: 0,
          },
          author: {
            name: `Murray Rothbot`,
            url: `https://murrayrothbot.com/`,
            icon_url: `https://murrayrothbot.com/murray-rothbot2.png`,
          },
          footer: {
            text: `Powered by Murray Rothbot • ${new Date().toLocaleString()}`,
            icon_url: `https://murrayrothbot.com/murray-rothbot2.png`,
          },
        },
      ],
    }

    const tickers = [
      { currency: 'USD', unity: '$', flag: '🇺🇸' },
      { currency: 'BRL', unity: 'R$', flag: '🇧🇷' },
    ]

    for (const { currency, unity, flag } of tickers) {
      const {
        data: { price, symbol, source, change24h },
      } = await this.pricesRepository.getTicker({
        symbol: `BTC${currency}`,
      })

      response.embeds[0].fields.push({
        name: `${flag} BTC${currency}`,
        value: `${change24h > 0 ? '🔼' : '🔽'}  ${(+change24h).toFixed(
          2,
        )}%\n${unity} ${(+price).toLocaleString()}\nSource: ${source}`,
      })
    }

    return response
  }
}
