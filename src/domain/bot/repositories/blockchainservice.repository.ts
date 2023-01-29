import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { AxiosResponse } from 'axios'
import { catchError, lastValueFrom, map } from 'rxjs'
import { ConfigService } from '@nestjs/config'
import { ServiceRepository } from './service.repository'

@Injectable()
export class BlockchainServiceRepository extends ServiceRepository {
  constructor(
    protected readonly httpService: HttpService,
    private readonly cfgService: ConfigService,
  ) {
    super(httpService)
  }

  baseUrl: string = this.cfgService.get<string>('BLOCKCHAIN_SERVICE')
  webhookUrl: string = this.cfgService.get<string>('CLIENT_DISCORD_WEBHOOK')

  getBlock({ hash = null, height = null }): Promise<any> | {} {
    let url = `${this.baseUrl}/block`

    if (hash) {
      url = `${url}?hash=${hash}`
    } else if (height) {
      if (isNaN(height)) return { data: null }
      url = `${url}?height=${height}`
    }

    return lastValueFrom(
      this.httpService.get(url).pipe(
        map((response: AxiosResponse<any>) => {
          return response.data
        }),
        catchError(async () => {
          console.error(url)
          return null
        }),
      ),
    )
  }

  getAddress({ address }): Promise<any> {
    const url = `${this.baseUrl}/address/${address}`

    return lastValueFrom(
      this.httpService.get(url).pipe(
        map((response: AxiosResponse<any>) => {
          return response.data
        }),
        catchError(async () => {
          console.error(url)
          return null
        }),
      ),
    )
  }

  getTransaction({ transaction }): Promise<any> {
    const url = `${this.baseUrl}/tx/${transaction}/mainnet`

    return lastValueFrom(
      this.httpService.get(url).pipe(
        map((response: AxiosResponse<any>) => {
          return response.data
        }),
        catchError(async () => {
          return null
        }),
      ),
    )
  }

  getFee(): Promise<any> {
    const url = `${this.baseUrl}/fees`

    return lastValueFrom(
      this.httpService.get(url).pipe(
        map((response: AxiosResponse<any>) => {
          return response.data
        }),
        catchError(async () => {
          return null
        }),
      ),
    )
  }

  createAlertFee({ userId, fee }): Promise<any> {
    const webhookUrl = `${this.webhookUrl}/alert-fee/${userId}`
    const url = `${this.baseUrl}/alert-fee`

    return lastValueFrom(
      this.httpService
        .post(url, {
          webhookUrl,
          fee,
        })
        .pipe(
          map((response: AxiosResponse<any>) => {
            return response.data
          }),
          catchError(async () => {
            return null
          }),
        ),
    )
  }

  listAlertFee({ userId }): Promise<any> {
    const webhookUrl = `${this.webhookUrl}/alert-fee/${userId}`
    const url = `${this.baseUrl}/alert-fee?webhookUrl=${webhookUrl}`

    return lastValueFrom(
      this.httpService.get(url).pipe(
        map((response: AxiosResponse<any>) => {
          return response.data
        }),
        catchError(async () => {
          return null
        }),
      ),
    )
  }

  createAlertTx({ userId, txId, confirmationsAlert }): Promise<any> {
    const webhookUrl = `${this.webhookUrl}/alert-tx/${userId}`
    const url = `${this.baseUrl}/alert-tx`

    return lastValueFrom(
      this.httpService
        .post(url, {
          webhookUrl,
          txId,
          confirmationsAlert,
        })
        .pipe(
          map((response: AxiosResponse<any>) => {
            return response.data
          }),
          catchError(async () => {
            return null
          }),
        ),
    )
  }

  listAlertTx({ userId }): Promise<any> {
    const webhookUrl = `${this.webhookUrl}/alert-tx/${userId}`
    const url = `${this.baseUrl}/alert-tx?webhookUrl=${webhookUrl}`

    return lastValueFrom(
      this.httpService.get(url).pipe(
        map((response: AxiosResponse<any>) => {
          return response.data
        }),
        catchError(async () => {
          return null
        }),
      ),
    )
  }

  getHashrate(): Promise<any> {
    const url = `${this.baseUrl}/hashrate`

    return lastValueFrom(
      this.httpService.get(url).pipe(
        map((response: AxiosResponse<any>) => {
          return response.data
        }),
        catchError(async () => {
          return null
        }),
      ),
    )
  }
}
