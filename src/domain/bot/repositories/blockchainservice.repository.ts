import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { AxiosResponse } from 'axios'
import { catchError, lastValueFrom, map } from 'rxjs'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class BlockchainServiceRepository {
  constructor(
    private readonly httpService: HttpService,
    private readonly cfgService: ConfigService,
  ) {}

  baseUrl: string = this.cfgService.get<string>('BLOCKCHAIN_SERVICE')
  webhookUrl: string = this.cfgService.get<string>('CLIENT_DISCORD_WEBHOOK')

  getBlock({ hash = null, height = null }): Promise<any> {
    let url = `${this.baseUrl}/block`

    if (hash) {
      url = `${url}?hash=${hash}`
    } else if (height) {
      url = `${url}?height=${height}`
    }

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

  getAddress({ address }): Promise<any> {
    const url = `${this.baseUrl}/address/${address}`

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

  getTransaction({ transaction }): Promise<any> {
    const url = `${this.baseUrl}/tx/${transaction}`

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
    const url = `${this.baseUrl}/alert-fee`
    const webhookUrl = `${this.webhookUrl}/alert-fee/${userId}`

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
}
