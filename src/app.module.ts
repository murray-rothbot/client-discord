import { NumbersModule } from './utils/numbers/numbers.module'
import { DiscordModule } from '@discord-nestjs/core'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { DiscordConfigService } from './config/discord.config.service'
import config from './config/env.config'
import { BotModule } from './domain/bot/bot.module'
import { ScheduleModule } from '@nestjs/schedule'
import { WebhooksModule } from './domain/webhooks/webhooks.module'

@Module({
  imports: [
    NumbersModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    DiscordModule.forRootAsync({
      imports: [ConfigModule, BotModule],
      useClass: DiscordConfigService,
    }),
    ScheduleModule.forRoot(),
    WebhooksModule,
  ],
})
export class AppModule {}
