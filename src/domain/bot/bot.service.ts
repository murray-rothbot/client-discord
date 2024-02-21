import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { MurrayServiceRepository } from './repositories'
@Injectable()
export class BotService {
  constructor(
    private readonly murrayService: MurrayServiceRepository,
    private readonly cfgService: ConfigService,
  ) {
    this.addCronjobList()
  }

  webhookUrl: string = this.cfgService.get<string>('CLIENT_DISCORD_WEBHOOK')

  // add cronjob list
  addCronjobList() {
    try {
      // cronjob list
      const cronjobList = [
        {
          webhook: `${this.webhookUrl}/new-fees`,
          interval: '*/10 * * * * *',
          type: 'fees',
        },
        {
          webhook: `${this.webhookUrl}/new-block`,
          interval: '*/10 * * * * *',
          type: 'block',
        },
        {
          webhook: `${this.webhookUrl}/new-price`,
          interval: '*/10 * * * * *',
          type: 'price',
        },
        {
          webhook: `${this.webhookUrl}/new-mempool`,
          interval: '*/10 * * * * *',
          type: 'mempool',
        },
      ]

      // add cronjob list
      this.murrayService.addCronJobs(cronjobList)
    } catch (error) {
      console.log(error)
    }
  }
}
