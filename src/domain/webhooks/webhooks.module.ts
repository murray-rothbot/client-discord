import { Module } from '@nestjs/common'
import { WebhooksService } from './webhooks.service'
import { WebhooksController } from './webhooks.controller'
import { HttpModule } from '@nestjs/axios'
import { DiscordModule } from '@discord-nestjs/core'
import { NumbersService } from 'src/utils/numbers/numbers.service'
import { BlockchainServiceRepository } from '../bot/repositories'

@Module({
  controllers: [WebhooksController],
  imports: [DiscordModule.forFeature(), HttpModule],
  providers: [WebhooksService, NumbersService, BlockchainServiceRepository],
})
export class WebhooksModule {}
