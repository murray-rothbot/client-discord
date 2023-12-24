import { InjectDiscordClient } from '@discord-nestjs/core'
import { Injectable, Logger } from '@nestjs/common'
import { Client, EmbedBuilder } from 'discord.js'
import { progressBar } from 'src/utils'
import { createResponse } from 'src/utils/default-response'
import { NumbersService } from 'src/utils/numbers/numbers.service'
import { PriceBodyDto, BlockBodyDto, MessageResponseDto } from './dto'

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name)
  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
    private readonly numbersService: NumbersService,
  ) {}

  sendAlertPrices(userId: string, alertPrice: MessageResponseDto) {
    this.client.users.fetch(userId).then(async (user) => {
      user.send(await createResponse(alertPrice))
    })

    this.logger.debug(`NEW WEBHOOK - Alert Price`)

    return true
  }

  sendAlertFee(userId: string, alertFee: MessageResponseDto) {
    this.client.users.fetch(userId).then(async (user) => {
      user.send(await createResponse(alertFee))
    })

    this.logger.debug(`NEW WEBHOOK - Alert Fee`)

    return true
  }

  sendAlertTx(userId: string, alertTx: MessageResponseDto) {
    this.client.users.fetch(userId).then(async (user) => {
      const expectedConfirmations = alertTx.fields.expectedConfirmations.value
      delete alertTx.fields.expectedConfirmations

      alertTx.fields.confirmations.value = progressBar(
        alertTx.fields.confirmations.value,
        expectedConfirmations,
        '🟢',
        '🟡',
      )

      user.send(await createResponse(alertTx))
    })

    this.logger.debug(`NEW WEBHOOK - Alert Tx`)

    return true
  }

  async updateNewBlock(block: BlockBodyDto) {
    if (block && block.height) {
      this.client.user.setActivity(`New Block: ${block.height}`)
      this.logger.debug(`NEW WEBHOOK - New Block: ${block.height}`)
    }
  }

  async updateNewPrice(tickers: PriceBodyDto) {
    try {
      const priceChangeUSD = tickers.usd.priceChangePercent <= 0 ? '▼' : '▲'
      const priceChangeBRL = tickers.brl.priceChangePercent <= 0 ? '▼' : '▲'
      const msg = `${priceChangeUSD}$${tickers.usd.formattedLastPrice} ${priceChangeBRL}R$${tickers.brl.formattedLastPrice}`
      const status = tickers.usd.priceChangePercent <= 0 ? 'dnd' : 'online'

      this.client.user.setStatus(status)
      this.client.user.setActivity(msg)
      this.logger.debug(`NEW WEBHOOK - New Price: ${msg}`)
    } catch (error) {
      this.logger.error(`NEW WEBHOOK - New Price: ${error}`)
    }
  }

  sendOpReturn(userId: string, payload: any) {
    this.client.users.fetch(userId).then(async (user) => {
      user.send(await createResponse(payload))
      this.logger.debug(`NEW WEBHOOK - OP-Return: ${userId}`)
    })

    return true
  }

  sendTip(userId: string, payload: any) {
    this.client.users.fetch(userId).then(async (user) => {
      user.send(await createResponse(payload))
      this.logger.debug(`NEW WEBHOOK - Tip: ${userId} - ${payload.fields.satoshis.value}`)
    })

    return true
  }
}
