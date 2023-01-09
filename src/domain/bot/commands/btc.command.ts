import { Command, DiscordTransformedCommand } from '@discord-nestjs/core'
import { CommandInteraction } from 'discord.js'
import { Injectable } from '@nestjs/common'
import { PricesServiceRepository } from '../repositories/pricesservice.repository'
import { BtcDTO } from '../dto/btc.dto'

@Command({
  name: 'btc',
  description: 'Show bitcoin fiat price',
})
@Injectable()
export class BTCCommand implements DiscordTransformedCommand<BtcDTO> {
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
          timestamp: new Date(),
          fields: [],
          author: {
            name: `Murray Rothbot`,
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

        const name = `${flag} ${symbol}`
        const arrow = change24h > 0 ? '🔼' : '🔽'
        const change_str = `${(+change24h).toFixed(2)}%`
        const price_str = (+price).toLocaleString()

        response.embeds[0].fields.push({
          name,
          value: `${arrow} ${change_str}\n${unity} ${price_str}\nSource: ${source}`,
        })
      }
    } catch (err) {
      console.error(err)

      response.embeds[0].title = 'ERROR'
      response.embeds[0].description = 'Something went wrong'
    }

    return response
  }
}
