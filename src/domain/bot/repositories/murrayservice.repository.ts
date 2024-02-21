import { AxiosResponse } from 'axios'
import { catchError, lastValueFrom, map } from 'rxjs'
import { ConfigService } from '@nestjs/config'
import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import { WebhooksService } from 'src/domain/webhooks/webhooks.service'

@Injectable()
export class MurrayServiceRepository {
  private readonly logger = new Logger(WebhooksService.name)
  constructor(
    private readonly httpService: HttpService,
    private readonly cfgService: ConfigService,
  ) {}

  baseUrl: string = this.cfgService.get<string>('MURRAY_SERVICE')
  webhookUrl: string = this.cfgService.get<string>('CLIENT_DISCORD_WEBHOOK')

  // Paid Services

  getInvoiceTip({ satoshis, user }): Promise<any> {
    const url = `${this.baseUrl}/payment/invoice/tip`
    const bodyData = {
      webhook: `${this.webhookUrl}/tip/${user.id}`,
      satoshis,
      userId: user.id,
      social: 'discord',
    }

    return this.postData(url, bodyData)
  }

  getInvoiceOpReturn({ message, user }): Promise<any> {
    const url = `${this.baseUrl}/payment/invoice/op-return`
    const bodyData = {
      webhook: `${this.webhookUrl}/op-return/${user.id}`,
      message,
      userId: user.id,
      social: 'discord',
    }

    return this.postData(url, bodyData)
  }

  getRank(): Promise<any> {
    const url = `${this.baseUrl}/payment/rank`
    return this.getData(url)
  }

  // Blockchain

  getAddress({ address }): Promise<any> {
    const url = `${this.baseUrl}/blockchain/address/${address}`
    return this.getData(url)
  }

  getBlock({ hash = null, height = null }): Promise<any> | {} {
    let url = `${this.baseUrl}/blockchain/block`

    if (hash) {
      url = `${url}?hash=${hash}`
    } else if (height) {
      if (isNaN(height)) return { data: null }
      url = `${url}?height=${height}`
    }

    return this.getData(url)
  }

  getDifficulty(): Promise<any> {
    const url = `${this.baseUrl}/blockchain/difficulty`
    return this.getData(url)
  }

  getFee(): Promise<any> {
    const url = `${this.baseUrl}/blockchain/fees`
    return this.getData(url)
  }

  getTransaction({ transaction }): Promise<any> {
    const url = `${this.baseUrl}/blockchain/tx/${transaction}/mainnet`
    return this.getData(url)
  }

  // Prices

  getPrices(): Promise<any> {
    const url = `${this.baseUrl}/prices`
    return this.getData(url)
  }

  convert({ value, currency }): Promise<any> {
    const url = `${this.baseUrl}/prices/convert?value=${value}&currency=${currency}`
    return this.getData(url)
  }

  // Lightning

  getLightingStatistics(): Promise<any> {
    const url = `${this.baseUrl}/lightning/statistics`
    return this.getData(url)
  }

  getLightingTop(): Promise<any> {
    const url = `${this.baseUrl}/lightning/top`
    return this.getData(url)
  }

  getLightingNode({ pubkey }): Promise<any> {
    const url = `${this.baseUrl}/lightning/node/${pubkey}`
    return this.getData(url)
  }

  // Market

  getMarketCap(): Promise<any> {
    const url = `${this.baseUrl}/market/capitalization`
    return this.getData(url)
  }

  // Alerts

  createFeeAlert({ userId, fee }): Promise<any> {
    try {
      const webhookUrl = `${this.webhookUrl}/alert-fee/${userId}`
      const url = `${this.baseUrl}/alert/fee`
      const bodyData = {
        webhookUrl,
        fee,
      }

      return this.postData(url, bodyData)
    } catch (error) {
      this.logger.error(`CREATE ALERT FEE - Alert Fee: ${error}`)
    }
  }

  getFeeAlertList({ userId }): Promise<any> {
    try {
      const webhook = this.createWebhookURL('fee', userId)
      const url = `${this.baseUrl}/alert/fee/?webhookUrl=${encodeURIComponent(webhook)}`
      return this.getData(url)
    } catch (error) {
      console.log(error)
    }
  }

  createPriceAlert({ userId, price, currency }): Promise<any> {
    const webhookUrl = `${this.webhookUrl}/alert-price/${userId}`
    const url = `${this.baseUrl}/alert/price`
    const bodyData = {
      webhookUrl,
      price,
      currency,
    }

    return this.postData(url, bodyData)
  }

  getPriceAlertList({ userId }): any {
    try {
      const webhook = this.createWebhookURL('price', userId)
      const url = `${this.baseUrl}/alert/price/?webhookUrl=${encodeURIComponent(webhook)}`
      return this.getData(url)
    } catch (error) {
      console.log(error)
    }
  }

  createTransactionAlert({ userId, txId, confirmations }): Promise<any> {
    const webhookUrl = this.createWebhookURL('transaction', userId)
    const url = `${this.baseUrl}/alert/transaction`
    const bodyData = {
      webhookUrl,
      txId,
      confirmations,
    }

    return this.postData(url, bodyData)
  }

  getTransactionAlertList({ userId }): Promise<any> {
    const webhook = this.createWebhookURL('transaction', userId)
    const url = `${this.baseUrl}/alert/transaction?webhookUrl=${encodeURIComponent(webhook)}`
    return this.getData(url)
  }

  createWebhookURL(type, userId) {
    return `${this.webhookUrl}/alert-${type}/${userId}`
  }

  // Cronjobs

  async addCronJobs(cronjobList): Promise<any> {
    try {
      cronjobList.forEach(async ({ webhook, type, interval }) => {
        const url = `${this.baseUrl}/cronjobs`
        const bodyData = {
          webhook: webhook,
          type: type,
          social: 'discord',
          interval: interval,
        }
        await this.postData(url, bodyData)
      })
    } catch (error) {
      console.log(error)
    }
  }

  // Base

  defaultError = [
    {
      property: 'backend',
      constraints: {
        isValid: 'backend is not working',
      },
    },
  ]

  protected postData(url: string, bodyData: {}): Promise<any> {
    try {
      Logger.debug(`POST ${url}`)

      return lastValueFrom(
        this.httpService.post(url, bodyData).pipe(
          map((response: AxiosResponse<any>) => {
            return response.data
          }),
          catchError(async () => {
            Logger.error(`POST ${url}\n${JSON.stringify(bodyData, null, 2)}`)
            throw this.defaultError
          }),
        ),
      )
    } catch (error) {
      console.log(error)
    }
  }

  protected getData(url: string): Promise<any> {
    try {
      Logger.debug(`GET ${url}`)

      return lastValueFrom(
        this.httpService.get(url).pipe(
          map((response: AxiosResponse<any>) => {
            return response.data
          }),
          catchError(async (err) => {
            Logger.error(`GET ${url}`)
            throw this.defaultError
          }),
        ),
      )
    } catch (error) {
      console.log(error)
    }
  }
}
