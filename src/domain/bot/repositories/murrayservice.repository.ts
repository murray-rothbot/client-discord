import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { AxiosResponse } from 'axios'
import { catchError, lastValueFrom, map } from 'rxjs'
import { ConfigService } from '@nestjs/config'
import { ServiceRepository } from './service.repository'

@Injectable()
export class MurrayServiceRepository extends ServiceRepository {
  constructor(
    protected readonly httpService: HttpService,
    private readonly cfgService: ConfigService,
  ) {
    super(httpService)
  }

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

  // Market

  getMarketCap(): Promise<any> {
    const url = `${this.baseUrl}/market/capitalization`
    return this.getData(url)
  }

  // Internal

  defaultError = [
    {
      property: 'backend',
      constraints: {
        isValid: 'backend is not working',
      },
    },
  ]

  private postData(url: string, bodyData: {}): Promise<any> {
    return lastValueFrom(
      this.httpService.post(url, bodyData).pipe(
        map((response: AxiosResponse<any>) => {
          return response.data
        }),
        catchError(async () => {
          throw this.defaultError
        }),
      ),
    )
  }

  private getData(url: string): Promise<any> {
    return lastValueFrom(
      this.httpService.get(url).pipe(
        map((response: AxiosResponse<any>) => {
          return response.data
        }),
        catchError(async () => {
          throw this.defaultError
        }),
      ),
    )
  }
}
