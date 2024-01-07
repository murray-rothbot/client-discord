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
        webhook: `${this.webhookUrl}/new-fees`,
        interval: '0 * * * * *',
        type: 'fees',
      },
      {
        webhook: `${this.webhookUrl}/new-block`,
        interval: '15 * * * * *',
        type: 'block',
      },
      {
        webhook: `${this.webhookUrl}/new-price`,
        interval: '30 * * * * *',
        type: 'price',
      },
      {
        webhook: `${this.webhookUrl}/new-mempool`,
        interval: '45 * * * * *',
        type: 'mempool',
      },
    ]

    // add cronjob list
    this.murrayService.addCronJobs(cronjobList)
  }
}
