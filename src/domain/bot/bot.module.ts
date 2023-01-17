import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { DiscordModule, registerFilterGlobally } from '@discord-nestjs/core'
import { CommandValidationFilter } from 'src/shared/filters/command-validation.filter'
import { BotMiddleware } from 'src/shared/middlewares/bot.middleware'
import { BotService } from './bot.service'
import {
  AddressCommand,
  AlertFeeCommand,
  AlertPriceCommand,
  AlertTxCommand,
  BlockchainCommand,
  BTCCommand,
  ConvertCommand,
  MyAlertFeeCommand,
  MyAlertPriceCommand,
  MyAlertTxCommand,
  // OpReturnCommand,
  TipCommand,
  TransactionCommand,
} from './commands'
import {
  BlockchainServiceRepository,
  MurrayServiceRepository,
  PricesServiceRepository,
} from './repositories'
import { NumbersService } from 'src/utils/numbers/numbers.service'
import { FeesCommand } from './commands/fees.command'

@Module({
  imports: [DiscordModule.forFeature(), HttpModule],
  providers: [
    {
      provide: registerFilterGlobally(),
      useClass: CommandValidationFilter,
    },
    BotMiddleware,
    BotService,

    // Data Providers
    BlockchainServiceRepository,
    PricesServiceRepository,
    MurrayServiceRepository,

    // Commands
    AddressCommand,
    AlertFeeCommand,
    AlertFeeCommand,
    AlertPriceCommand,
    AlertPriceCommand,
    AlertTxCommand,
    BlockchainCommand,
    BTCCommand,
    ConvertCommand,
    FeesCommand,
    MyAlertFeeCommand,
    MyAlertPriceCommand,
    MyAlertTxCommand,
    // OpReturnCommand,
    TransactionCommand,
    TipCommand,

    // Helpers
    NumbersService,
  ],
})
export class BotModule {}
