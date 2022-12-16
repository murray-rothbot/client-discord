import { HttpService } from '@nestjs/axios'
import { AxiosResponse } from 'axios'
import { HttpStatus, Injectable } from '@nestjs/common'
import { catchError, lastValueFrom, map, Observable } from 'rxjs'
import { SampleRequestDto } from './dto'
import { IBinanceTicker } from './interfaces'

@Injectable()
export class SampleRepository {
  constructor(private readonly httpService: HttpService) {}

  getTicker({ symbol }: SampleRequestDto): Promise<IBinanceTicker> {
    const url = `https://api3.binance.com/api/v3/ticker?symbol=${symbol}`

    return lastValueFrom(
      this.httpService.get(url).pipe(
        map((response: AxiosResponse<any>) => {
          return response.data as IBinanceTicker
        }),
        catchError(async () => {
          // TODO: Log errordto
          return null
        }),
      ),
    )
  }
}
