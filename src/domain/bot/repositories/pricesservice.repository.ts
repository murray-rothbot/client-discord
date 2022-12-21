import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { AxiosResponse } from 'axios'
import { catchError, lastValueFrom, map } from 'rxjs'

@Injectable()
export class PricesServiceRepository {
  baseUrl: string = process.env.PRICE_SERVICE

  constructor(private readonly httpService: HttpService) {}

  getTicker({ symbol }): Promise<any> {
    const url = `${this.baseUrl}/ticker?symbol=${symbol}`

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
