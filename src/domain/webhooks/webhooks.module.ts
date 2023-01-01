import { Module } from '@nestjs/common'
import { WebhooksService } from './webhooks.service'
import { WebhooksController } from './webhooks.controller'
import { HttpModule } from '@nestjs/axios'
import { DiscordModule } from '@discord-nestjs/core'
import { NumbersService } from 'src/utils/numbers/numbers.service'

@Module({
  controllers: [WebhooksController],
  imports: [DiscordModule.forFeature(), HttpModule],
  providers: [WebhooksService, NumbersService],
})
export class WebhooksModule {}
