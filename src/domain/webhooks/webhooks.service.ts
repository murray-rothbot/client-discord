import { InjectDiscordClient } from '@discord-nestjs/core'
import { Injectable, Logger } from '@nestjs/common'
import { Client, EmbedBuilder } from 'discord.js'
import { createResponse } from 'src/utils/default-response'
import { NumbersService } from 'src/utils/numbers/numbers.service'
import { BlockchainServiceRepository } from '../bot/repositories/blockchainservice.repository'
import {
  AlertPriceBodyDto,
  AlertFeeBodyDto,
  AlertTxBodyDto,
  PriceBodyDto,
  BlockBodyDto,
} from './dto'

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name)
  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
    private readonly numbersService: NumbersService,
    private readonly blockchainService: BlockchainServiceRepository,
  ) {}

  sendAlertPrices(userId: string, alertPrice: AlertPriceBodyDto) {
    this.client.users.fetch(userId).then((user) => {
      const { price, currency, above } = alertPrice

      const currentPrice =
        currency === 'USD'
          ? this.numbersService.formatterUSD.format(alertPrice.currentPrice)
          : this.numbersService.formatterBRL.format(alertPrice.currentPrice)
      const side = above ? 'Higher or equal then:\n📈 ' : 'Lower or equal then\n📉 '
      const flag = currency === 'USD' ? '🇺🇸' : '🇧🇷'
      const priceAlert =
        currency === 'USD'
          ? this.numbersService.formatterUSD.format(price)
          : this.numbersService.formatterBRL.format(price)

      const fields = []
      fields.push({
        name: 'Your alert price was reached!',
        value: `**\n${side}${flag} ${priceAlert}\n\nCurrent Price:\n${flag} ${currentPrice}**`,
      })

      const embed = new EmbedBuilder()
        .setTitle(`🔔 New Alert Price`)
        .setFields(fields)
        .setFooter({
          text: `Powered by Murray Rothbot`,
          iconURL: `https://murrayrothbot.com/murray-rothbot2.png`,
        })
        .setTimestamp(new Date())
        .setColor(0x1eff00)

      user.send({
        embeds: [embed],
      })
    })

    this.logger.debug(`NEW WEBHOOK - Alert Price`)

    return true
  }

  sendAlertFee(userId: string, alertFee: AlertFeeBodyDto) {
    this.client.users.fetch(userId).then(async (user) => {
      const fees = await this.blockchainService.getFee()
      const { fee } = alertFee

      const fields = []
      fields.push({
        name: 'Your alert fee was reached!',
        value: `**\nLower or equal then:**\n⬇️ ${fee} sats/vByte\n\n**Current Fee:**\n${fees.data.fastestFee} sats/vByte\n`,
      })

      if (fee == 1) {
        fields.push({
          name: '\u200B\nGreat moment to:',
          value: '* Do a coinjoin\n* Consolidate your UTXOs\n* Open a Lightning Channel',
          inline: false,
        })
      }

      const embed = new EmbedBuilder()
        .setTitle(`🔔 New Alert Fee`)
        .setFields(fields)
        .setFooter({
          text: `Powered by Murray Rothbot`,
          iconURL: `https://murrayrothbot.com/murray-rothbot2.png`,
        })
        .setTimestamp(new Date())
        .setColor(0x1eff00)

      user.send({
        embeds: [embed],
      })
    })

    this.logger.debug(`NEW WEBHOOK - Alert Fee`)

    return true
  }

  sendAlertTx(userId: string, alertTx: AlertTxBodyDto) {
    this.client.users.fetch(userId).then(async (user) => {
      const fields = []
      fields.push({
        name: 'Transaction Hex:',
        value: `🔀 ${alertTx.txId}`,
      })

      const confirmationsLeft = alertTx.confirmationsAlert - alertTx.currentConfirmation
      let confirmationsDone = alertTx.currentConfirmation
      if (alertTx.currentConfirmation >= 6) {
        confirmationsDone = 6
      }
      const confirmationIcons = []
      for (let i = 0; i < confirmationsDone; i++) {
        confirmationIcons.push('🟢')
      }
      for (let i = 0; i < confirmationsLeft; i++) {
        confirmationIcons.push('🟡')
      }
      fields.push({
        name: `✅ Confirmations: ${alertTx.currentConfirmation}/${alertTx.confirmationsAlert}`,
        value: `${confirmationIcons.join('')}`,
        inline: true,
      })

      const embed = new EmbedBuilder()
        .setTitle(`🔔 Alert Transaction Confirmation`)
        .setFields(fields)
        .setFooter({
          text: `Powered by Murray Rothbot`,
          iconURL: `https://murrayrothbot.com/murray-rothbot2.png`,
        })
        .setTimestamp(new Date())
        .setColor(0x1eff00)

      user.send({
        embeds: [embed],
      })
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
    const priceChangeUSD = tickers.usd.priceChangePercent <= 0 ? '▼' : '▲'
    const priceChangeBRL = tickers.brl.priceChangePercent <= 0 ? '▼' : '▲'
    const msg = `${priceChangeUSD}$${tickers.brl.formattedLastPrice} ${priceChangeBRL}R$${tickers.usd.formattedLastPrice}`
    const status = tickers.usd.priceChangePercent <= 0 ? 'dnd' : 'online'

    this.client.user.setStatus(status)
    this.client.user.setActivity(msg)
    this.logger.debug(`NEW WEBHOOK - New Price: ${msg}`)
  }

  sendOpReturn(userId: string, payload: any) {
    this.client.users.fetch(userId).then(async (user) => {
      // remove unnecessary keys from object
      delete payload.fields.txId
      delete payload.fields.url

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
