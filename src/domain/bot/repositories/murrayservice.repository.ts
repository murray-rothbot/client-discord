import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { AxiosResponse } from 'axios'
import { catchError, lastValueFrom, map } from 'rxjs'
import { ConfigService } from '@nestjs/config'
import { InvoiceTip, InvoiceTipResponse } from 'src/domain/interfaces'

@Injectable()
export class MurrayServiceRepository {
  constructor(
    private readonly httpService: HttpService,
    private readonly cfgService: ConfigService,
  ) {}

  baseUrl: string = this.cfgService.get<string>('MURRAY_SERVICE')
  webhookUrl: string = this.cfgService.get<string>('CLIENT_DISCORD_WEBHOOK')

  getInvoiceTip({ num_satoshis, user }: InvoiceTip): Promise<any> {
    const url = `${this.baseUrl}/payment/invoice/tip`
    const bodyData = {
      num_satoshis,
      memo: 'Tip Murray Rothbot',
      user: JSON.stringify(user),
    }
    return lastValueFrom(
      this.httpService.post(url, bodyData).pipe(
        map((response: AxiosResponse<InvoiceTipResponse>) => {
          return response.data
        }),
        catchError(async () => {
          return null
        }),
      ),
    )
  }

  // getInvoiceOpReturn({ num_satoshis, memo, user }): Promise<any> {
  //   const url = `${this.baseUrl}/payment/tip`
  //   const bodyData = {
  //     num_satoshis: 100,
  //     memo: 'Tip Murray Rothbot',
  //     user: 'murray',
  //   }
  //   return lastValueFrom(
  //     this.httpService.post(url, bodyData).pipe(
  //       map((response: AxiosResponse<any>) => {
  //         return response.data
  //       }),
  //       catchError(async () => {
  //         return null
  //       }),
  //     ),
  //   )
  // }

  // getInvoiceProofOfExistence({ num_satoshis, memo, user }): Promise<any> {
  //   const url = `${this.baseUrl}/payment/tip`
  //   const bodyData = {
  //     num_satoshis: 100,
  //     memo: 'Tip Murray Rothbot',
  //     user: 'murray',
  //   }
  //   return lastValueFrom(
  //     this.httpService.post(url, bodyData).pipe(
  //       map((response: AxiosResponse<any>) => {
  //         return response.data
  //       }),
  //       catchError(async () => {
  //         return null
  //       }),
  //     ),
  //   )
  // }
}
