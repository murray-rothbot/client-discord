import { Module } from '@nestjs/common'
import { DiscordModule, registerFilterGlobally } from '@discord-nestjs/core'
import { BotService } from './bot.service'
import { HelpCommand, OpreturnCommand } from './commands'
import { CommandValidationFilter } from 'src/shared/filters/command-validation.filter'
import { BotMiddleware } from 'src/shared/middlewares/bot.middleware'

@Module({
  imports: [DiscordModule.forFeature()],
  providers: [
    {
      provide: registerFilterGlobally(),
      useClass: CommandValidationFilter,
    },
    BotMiddleware,
    BotService,
    // Commands
    OpreturnCommand,
    HelpCommand,
  ],
})
export class BotModule {}
