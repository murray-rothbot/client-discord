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
    const embeds = []

    for (const ticker of ['btcusd', 'btcbrl']) {
      const {
        data: { price, symbol, source, change24h },
      } = await this.pricesRepository.getTicker({
        symbol: ticker,
      })

      const embed = new EmbedBuilder()
        .setTitle(`Bitcoin ${ticker.substring(3).toUpperCase()} Price`)
        .addFields(
          { name: 'Source', value: source },
          { name: 'Symbol', value: symbol },
          { name: 'Price', value: (+price).toFixed(2) },
          { name: '24h change', value: `${(+change24h).toFixed(2)}%` },
        )
      embeds.push(embed)
    }

    return { embeds }
  }
}
