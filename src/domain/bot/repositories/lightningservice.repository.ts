import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { AxiosResponse } from 'axios'
import { catchError, lastValueFrom, map } from 'rxjs'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class LightningServiceRepository {
  constructor(
    private readonly httpService: HttpService,
    private readonly cfgService: ConfigService,
  ) {}

  baseUrl: string = this.cfgService.get<string>('LIGHTNING_SERVICE')

  getNetworkStatistics(): Promise<any> {
    let url = `${this.baseUrl}/statistics`

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

  getTopNodes(): Promise<any> {
    let url = `${this.baseUrl}/top`

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

  getNode({ pubkey }): Promise<any> {
    let url = `${this.baseUrl}/node/${pubkey}`

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