import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { DiscordModule, registerFilterGlobally } from '@discord-nestjs/core'
import { CommandValidationFilter } from 'src/shared/filters/command-validation.filter'
import { BotMiddleware } from 'src/shared/middlewares/bot.middleware'
import { BotService } from './bot.service'
import { BlockchainCommand, BTCCommand, HelpCommand, OpreturnCommand } from './commands'
import { BlockchainServiceRepository, PricesServiceRepository } from './repositories'
import { NumbersService } from 'src/utils/numbers/numbers.service'
import { AddressCommand } from './commands/address.command'
import { TransactionCommand } from './commands/tx.command'

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
    AddressCommand,
    BlockchainCommand,
    BTCCommand,
    OpreturnCommand,
    HelpCommand,
    TransactionCommand,

    // Helpers
    NumbersService,
  ],
})
export class BotModule {}
