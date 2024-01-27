import { Injectable } from '@nestjs/common'
import { DiscordModuleOption, DiscordOptionsFactory } from '@discord-nestjs/core'
import { GatewayIntentBits } from 'discord.js'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class DiscordConfigService implements DiscordOptionsFactory {
  constructor(private readonly cfgService: ConfigService) {}

  createDiscordOptions(): DiscordModuleOption {
    return {
      token: this.cfgService.get<string>('DISCORD_API_KEY'),
      discordClientOptions: {
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.MessageContent,
          GatewayIntentBits.GuildMembers,
          GatewayIntentBits.GuildIntegrations,
          GatewayIntentBits.GuildPresences,
        ],
      },
      registerCommandOptions: [
        {
          removeCommandsBefore: true,
        },
      ],
    }
  }
}
