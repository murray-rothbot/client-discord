import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { DiscordModule, registerFilterGlobally } from '@discord-nestjs/core'
import { CommandValidationFilter } from 'src/shared/filters/command-validation.filter'
import { BotMiddleware } from 'src/shared/middlewares/bot.middleware'
import { BotService } from './bot.service'
import { BlockchainCommand, BTCCommand, HelpCommand, OpreturnCommand } from './commands'
import { BlockchainServiceRepository, PricesServiceRepository } from './repositories'
import { NumbersService } from 'src/utils/numbers/numbers.service'

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
    BlockchainServiceRepository,
    PricesServiceRepository,

    // Commands
    BlockchainCommand,
    BTCCommand,
    OpreturnCommand,
    HelpCommand,

    // Helpers
    NumbersService,
  ],
})
export class BotModule {}
