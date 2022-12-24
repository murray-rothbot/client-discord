import { Module } from '@nestjs/common'
import { DiscordModule, registerFilterGlobally } from '@discord-nestjs/core'
import { BotService } from './bot.service'
import { HelpCommand, OpreturnCommand, BTCCommand } from './commands'
import { CommandValidationFilter } from 'src/shared/filters/command-validation.filter'
import { BotMiddleware } from 'src/shared/middlewares/bot.middleware'
import {} from './commands/btc.command'
import { PricesServiceRepository } from './repositories/pricesservice.repository'
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [DiscordModule.forFeature(), HttpModule],
  providers: [
    {
      provide: registerFilterGlobally(),
      useClass: CommandValidationFilter,
    },
    BotMiddleware,
    BotService,

    // Data Prividers
    PricesServiceRepository,

    // Commands
    OpreturnCommand,
    HelpCommand,
    BTCCommand,
  ],
})
export class BotModule {}
