import { Command, DiscordCommand } from '@discord-nestjs/core'
import { CommandInteraction } from 'discord.js'
import { Injectable } from '@nestjs/common'
import { BlockchainServiceRepository, PricesServiceRepository } from '../repositories'
import { NumbersService } from 'src/utils/numbers/numbers.service'

@Command({
  name: 'marketinfo',
  description: 'Market capitalization information',
})
@Injectable()
export class MarketInfoCommand implements DiscordCommand {
  constructor(
    private readonly priceRepository: PricesServiceRepository,
    private readonly blockRepository: BlockchainServiceRepository,
    private readonly numbersService: NumbersService,
  ) {}

  async handler(interaction: CommandInteraction): Promise<{}> {
    const response = {
      content: '',
      tts: false,
      embeds: [
        {
          type: 'rich',
          title: '💰 Estatística de Mercado',
          description: '',
          color: 0xff9900,
          timestamp: new Date(),
          fields: [],
          footer: {
            text: `Powered by Murray Rothbot`,
            icon_url: `https://murrayrothbot.com/murray-rothbot2.png`,
          },
        },
      ],
    }

    const fields = response.embeds[0].fields

    try {
      const currencies = {
        btcusd: {
          singular: 'Dólar',
          plural: 'Dólares',
          formatter: this.numbersService.formatterUSD,
          flag: '🇺🇸',
        },
        btcbrl: {
          singular: 'Real',
          plural: 'Reais',
          formatter: this.numbersService.formatterBRL,
          flag: '🇧🇷',
        },
        // Uncomment when service-price is able to return XAU e XAG prices
        // btcxau: {
        //   singular: 'grama',
        //   plural: 'gramas',
        //   formatter: (x) => x,
        //   flag: '🪙',
        // },
        // btcxag: {
        //   singular: 'grama',
        //   plural: 'gramas',
        //   formatter: (x) => x,
        //   flag: '⚪',
        // },
      }

      const prices = (
        await Promise.all(Object.keys(currencies).map((symbol) => this.getTicker({ symbol })))
      ).filter((x) => x.data)

      const {
        data: { height },
      } = await this.blockRepository.getBlock({})
      const supply = this.calculateSupply(height)

      for (const {
        data: { symbol, price },
      } of prices) {
        const { singular, plural, code, formatter, flag } = currencies[symbol.toLowerCase()]

        const sats = Math.round(1e8 / price)
        const market = Math.round(supply * price)

        fields.push({
          name: `Valor em ${plural}`,
          value: formatter.format(price),
          inline: true,
        })
        fields.push({
          name: `Sats por ${singular}`,
          value: `${this.numbersService.formatterSATS.format(sats)} sats`,
          inline: true,
        })
        fields.push({
          name: `Valor de Mercado ${flag}`,
          value: this.numbersService.kFormatter(market, formatter),
          inline: true,
        })
      }
    } catch (err) {
      console.error(err)

      response.embeds[0].title = 'ERROR'
      response.embeds[0].description = 'Something went wrong'
    }

    return response
  }

  async getTicker({ symbol }) {
    const response = await this.priceRepository.getTicker({ symbol })

    if (response.data) {
      response.data.symbol = symbol
    }

    return response
  }

  calculateSupply(height) {
    if (height >= 33 * 210000) {
      return 20999999.9769
    } else {
      let reward = 50e8
      let supply = 0
      let y = 210000 // reward changes all y blocks
      while (height > y - 1) {
        supply = supply + y * reward
        reward = Math.floor(reward / 2.0)
        height = height - y
      }
      supply = supply + height * reward
      return (supply + reward) / 1e8
    }
  }
}
