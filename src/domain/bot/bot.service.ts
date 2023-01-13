import { Injectable, Logger } from '@nestjs/common'
import { InjectDiscordClient } from '@discord-nestjs/core'
import { Client } from 'discord.js'
import { Cron } from '@nestjs/schedule'
import { PricesServiceRepository } from './repositories/pricesservice.repository'
import { NumbersService } from 'src/utils/numbers/numbers.service'
@Injectable()
export class BotService {
  private readonly logger = new Logger(BotService.name)

  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
    private readonly pricesRepository: PricesServiceRepository,
    private readonly numbersService: NumbersService,
  ) {}

  @Cron('*/10 * * * * *')
  async updatePresence() {
    this.logger.debug(`Update presence Tickers.`)
    const symbols = ['BTCUSD', 'BTCBRL']
    const promises = symbols.map(async (symbol) => {
      return await this.pricesRepository.getTicker({ symbol })
    })
    const tickers = (await Promise.all(promises)).filter((ticker) => ticker != null)

    let lastPriceUsd = 0
    let lastPriceBrl = 0
    let priceChangePercentUsd = 0
    let priceChangePercentBrl = 0

    tickers.map(({ data }) => {
      if (data.symbol === 'BTCUSDT') {
        lastPriceUsd = data.price
        priceChangePercentUsd = data.change24h
      } else if (data.symbol === 'BTCBRL') {
        lastPriceBrl = data.price
        priceChangePercentBrl = data.change24h
      }
    })

    // check if both prices are available
    if (lastPriceUsd > 0 && lastPriceBrl > 0) {
      const priceChangeUSD = priceChangePercentUsd <= 0 ? '▼' : '▲'
      const priceChangeBRL = priceChangePercentBrl <= 0 ? '▼' : '▲'
      const msg = `${priceChangeUSD}$${this.numbersService.kFormatter(
        lastPriceUsd,
      )} ${priceChangeBRL}R$${this.numbersService.kFormatter(lastPriceBrl)}`
      const status = priceChangePercentUsd <= 0 ? 'dnd' : 'online'

      this.client.user.setStatus(status)
      this.client.user.setActivity(msg)
    } else {
      this.logger.error(`Update presence Tickers failed.`)
    }
  }
}
