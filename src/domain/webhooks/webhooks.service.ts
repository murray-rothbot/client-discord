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
    try {
      this.client.users.fetch(userId).then(async (user) => {
        user.send(await createResponse(alertPrice))
      })

      this.logger.debug(`NEW WEBHOOK - Alert Price`)

      return true
    } catch (error) {
      this.logger.error(`NEW WEBHOOK - Alert Price: ${error}`)
    }
  }

  sendAlertFee(userId: string, alertFee: MessageResponseDto) {
    try {
      this.client.users.fetch(userId).then(async (user) => {
        user.send(await createResponse(alertFee))
      })

      this.logger.debug(`NEW WEBHOOK - Alert Fee`)

      return true
    } catch (error) {
      this.logger.error(`NEW WEBHOOK - Alert Fee: ${error}`)
    }
  }

  sendAlertTx(userId: string, alertTx: MessageResponseDto) {
    try {
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
    } catch (error) {
      this.logger.error(`NEW WEBHOOK - Alert Tx: ${error}`)
    }
  }

  async updateNewBlock(block: BlockBodyDto) {
    try {
      if (block && block.height) {
        this.client.user.setActivity(`New Block: ${block.height}`)
        this.logger.debug(`NEW WEBHOOK - New Block: ${block.height}`)
      }
    } catch (error) {
      this.logger.error(`NEW WEBHOOK - New Block: ${error}`)
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
    try {
      this.client.users.fetch(userId).then(async (user) => {
        user.send(await createResponse(payload))
        this.logger.debug(`NEW WEBHOOK - OP-Return: ${userId}`)
      })

      return true
    } catch (error) {
      this.logger.error(`NEW WEBHOOK - OP-Return: ${error}`)
    }
  }

  sendTip(userId: string, payload: any) {
    try {
      this.client.users.fetch(userId).then(async (user) => {
        user.send(await createResponse(payload))
        this.logger.debug(`NEW WEBHOOK - Tip: ${userId} - ${payload.fields.satoshis.value}`)
      })

      return true
    } catch (error) {
      this.logger.error(`NEW WEBHOOK - Tip: ${error}`)
    }
  }
}
