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
    // cronjob list
    const cronjobList = [
      {
        webhook: `${this.webhookUrl}/new-price`,
        interval: '*/20 * * * * *',
        type: 'price',
      },
      {
        webhook: `${this.webhookUrl}/new-block`,
        interval: '* * * * * *',
        type: 'block',
      },
    ]

    // add cronjob list
    this.murrayService.addCronJobs(cronjobList)
  }
}
