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

  baseUrl: string = this.cfgService.get<string>('MURRAY_SERVICE')

  createAlertPrice({ userId, userInfo, price, currency }): Promise<any> {
    const url = `${this.baseUrl}/alert-price`
    return lastValueFrom(
      this.httpService
        .post(url, {
          userId,
          userInfo,
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
