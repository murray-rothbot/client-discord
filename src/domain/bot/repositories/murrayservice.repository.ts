import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { AxiosResponse } from 'axios'
import { catchError, lastValueFrom, map } from 'rxjs'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class MurrayServiceRepository {
  constructor(
    private readonly httpService: HttpService,
    private readonly cfgService: ConfigService,
  ) {}

  baseUrl: string = this.cfgService.get<string>('PRICE_SERVICE')
  webhookUrl: string = this.cfgService.get<string>('CLIENT_DISCORD_WEBHOOK')

  createAlertPrice({ userId, price, currency }): Promise<any> {
    const url = `${this.baseUrl}/alert-price`
    const webhookUrl = `${this.webhookUrl}/alert-price/${userId}`
    return lastValueFrom(
      this.httpService
        .post(url, {
          webhookUrl,
          price,
          currency,
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
