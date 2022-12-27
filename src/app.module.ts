import { NumbersModule } from './utils/numbers/numbers.module'
import { DiscordModule } from '@discord-nestjs/core'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { DiscordConfigService } from './config/discord.config.service'
import config from './config/env.config'
import { BotModule } from './domain/bot/bot.module'
import { ScheduleModule } from '@nestjs/schedule'
import { WebSocketModule } from 'nestjs-websocket'

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
    WebSocketModule.forRoot({
      url: 'wss://mempool.space/api/v1/ws',
    }),
  ],
})
export class AppModule {}
