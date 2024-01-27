import { InjectDiscordClient } from '@discord-nestjs/core'
import { Injectable, Logger } from '@nestjs/common'
import { ActivityType, Client } from 'discord.js'
import { progressBar } from 'src/utils'
import { createResponse } from 'src/utils/default-response'
import { NumbersService } from 'src/utils/numbers/numbers.service'
import { PriceBodyDto, BlockBodyDto, MessageResponseDto, FeesBodyDto, MempoolBodyDto } from './dto'
import { ConfigService } from '@nestjs/config'
import { setTimeout } from 'timers/promises'

@Injectable()
export class WebhooksService {
  private readonly tbdGuildId = this.cfgService.get<string>('TBD_GUILD_ID')
  private readonly logger = new Logger(WebhooksService.name)

  private currentMempoolInfo: MempoolBodyDto | null = null
  private currentFeesInfo: FeesBodyDto | null = null
  private currentPriceInfo: PriceBodyDto | null = null
  private currentBlockInfo: BlockBodyDto | null = null

  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
    private readonly numbersService: NumbersService,
    private readonly cfgService: ConfigService,
  ) {
    this.startUpdateLoop()
  }

  private async startUpdateLoop() {
    await this.updateInformation()
    setInterval(async () => {
      await this.updateInformation()
    }, 60000)
  }

  private async updateInformation() {
    if (this.currentBlockInfo) {
      this.client.user.setActivity(`${this.currentBlockInfo.height} block height`, {
        type: ActivityType.Watching,
      })
      await setTimeout(5000)
    }

    if (this.currentMempoolInfo) {
      this.client.user.setActivity(` ${this.currentMempoolInfo.count} txs unconfirmed`, {
        type: ActivityType.Watching,
      })
      await setTimeout(5000)
    }

    if (this.currentFeesInfo) {
      this.client.user.setActivity(`${this.currentFeesInfo.fastestFee} sats/vByte`, {
        type: ActivityType.Watching,
      })
      await setTimeout(5000)
    }

    if (this.currentPriceInfo) {
      const priceChangeUSD = this.currentPriceInfo.usd.priceChangePercent <= 0 ? '▼' : '▲'
      const priceChangeBRL = this.currentPriceInfo.brl.priceChangePercent <= 0 ? '▼' : '▲'
      const msg = `${priceChangeUSD}$${this.currentPriceInfo.usd.formattedLastPrice} ${priceChangeBRL}R$${this.currentPriceInfo.brl.formattedLastPrice}`
      const status = this.currentPriceInfo.usd.priceChangePercent <= 0 ? 'dnd' : 'online'

      this.client.user.setStatus(status)
      this.client.user.setActivity(msg, {
        type: ActivityType.Playing,
      })
      await setTimeout(45000)
    }
  }

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

  async updateNewMempool(mempool: MempoolBodyDto) {
    try {
      if (mempool && mempool.count) {
        this.currentMempoolInfo = mempool
        this.logger.debug(`NEW WEBHOOK - Mempool Info: ${mempool.count}`)
      }
    } catch (error) {
      this.logger.error(`NEW WEBHOOK -  Mempool Info: ${error}`)
    }
  }

  async updateNewBlock(block: BlockBodyDto) {
    try {
      if (block && block.height) {
        this.currentBlockInfo = block
        this.logger.debug(`NEW WEBHOOK - Block: ${block.height}`)
      }
    } catch (error) {
      this.logger.error(`NEW WEBHOOK - Block: ${error}`)
    }
  }

  async updateNewFees(fees: FeesBodyDto) {
    try {
      if (fees.fastestFee) {
        this.currentFeesInfo = fees
        this.logger.debug(`NEW WEBHOOK - New Fees: ${fees.fastestFee} sats/vByte`)
      }
    } catch (error) {
      this.logger.error(`NEW WEBHOOK - New Fees: ${error}`)
    }
  }

  async updateNewPrice(tickers: PriceBodyDto) {
    try {
      this.currentPriceInfo = tickers
      this.logger.debug(`NEW WEBHOOK - New Price: ${tickers.usd.formattedLastPrice}`)
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
        this.logger.debug(`NEW WEBHOOK - Tip: ${user.id} - ${payload.fields.satoshis.value}`)

        const server = this.client.guilds.cache.get(this.tbdGuildId)
        const memberRole = server.roles.cache.find((role) => role.name === 'Aristocrata')
        const member = server.members.cache.get(user.id)

        if (member) {
          member.roles.add(memberRole)
          this.logger.debug(`New Aristocrata: ${user.username}`)
        }
      })

      return true
    } catch (error) {
      this.logger.error(`NEW WEBHOOK - Tip: ${error}`)
    }
  }
}
