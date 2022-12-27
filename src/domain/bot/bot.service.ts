import { Injectable, Logger } from '@nestjs/common'
import { Once, InjectDiscordClient } from '@discord-nestjs/core'
import { Client } from 'discord.js'
import { Cron } from '@nestjs/schedule'
import { PricesServiceRepository } from './repositories/pricesservice.repository'
import { NumbersService } from 'src/utils/numbers/numbers.service'
import {
  InjectWebSocketProvider,
  WebSocketClient,
  OnOpen,
  OnClose,
  OnMessage,
} from 'nestjs-websocket'

@Injectable()
export class BotService {
  private readonly logger = new Logger(BotService.name)
  private data: Record<any, any> = {}
  private wsConnected = false

  constructor(
    @InjectWebSocketProvider()
    private readonly ws: WebSocketClient,
    @InjectDiscordClient()
    private readonly client: Client,
    private readonly pricesRepository: PricesServiceRepository,
    private readonly numbersService: NumbersService,
  ) {}

  @OnOpen()
  openWs() {
    try {
      this.logger.log(`Mempool.Space Websocket is established.`)
      this.ws.send(
        JSON.stringify({
          action: 'want',
          data: ['blocks', 'fees'],
        }),
      )
      this.pingWs()
      this.wsConnected = true
    } catch (error) {
      this.wsConnected = false
    }
  }

  @OnClose()
  closeWs() {
    this.wsConnected = false
  }

  pingWs() {
    this.ws.send(
      JSON.stringify({
        action: 'ping',
      }),
    )
  }

  @Cron('*/10 * * * * *')
  checkWs() {
    this.pingWs()
    if (this.wsConnected) return
    this.logger.error(`Mempool.Space Websocket is disconnected.`)
    this.openWs()
  }

  @OnMessage()
  messageWs(data: WebSocketClient.Data) {
    this.data = JSON.parse(data.toString())
    if (this.data.block) {
      this.client.user.setActivity(`New Block: ${this.data.block.height}`)
    }
    if (this.data.pong) {
      this.logger.debug(`Mempool.Space Websocket pong.`)
    }
  }

  @Once('ready')
  async onReady() {
    this.logger.log(`Bot ${this.client.user.tag} was started!`)
    this.openWs()
    this.updatePresence()
  }

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
