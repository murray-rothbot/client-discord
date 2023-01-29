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

  getInvoiceTip({ satoshis, user }): Promise<any> {
    const url = `${this.baseUrl}/payment/invoice/tip`
    const bodyData = {
      webhook: `${this.webhookUrl}/tip/${user.id}`,
      satoshis,
      userId: user.id,
      social: 'discord',
    }

    return lastValueFrom(
      this.httpService.post(url, bodyData).pipe(
        map((response: AxiosResponse<any>) => {
          return response.data
        }),
        catchError(async () => {
          return null
        }),
      ),
    )
  }

  getInvoiceOpReturn({ message, user }): Promise<any> {
    const url = `${this.baseUrl}/payment/invoice/op-return`
    const bodyData = {
      webhook: `${this.webhookUrl}/op-return/${user.id}`,
      message,
      userId: user.id,
      social: 'discord',
    }

    return lastValueFrom(
      this.httpService.post(url, bodyData).pipe(
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
