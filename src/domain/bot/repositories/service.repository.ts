import { HttpService } from '@nestjs/axios'
import { catchError, lastValueFrom, map } from 'rxjs'
import { AxiosResponse } from 'axios'

export class ServiceRepository {
  baseUrl: string = ''
  webhookUrl: string = ''

  constructor(protected readonly httpService: HttpService) {}

  getHealth(): Promise<any> {
    const url = `${this.baseUrl}/health`

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
