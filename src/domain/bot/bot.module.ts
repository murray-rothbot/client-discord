import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { DiscordModule, registerFilterGlobally } from '@discord-nestjs/core'
import { CommandExceptionFilter } from 'src/shared/filters/command-exception.filter'
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
  DifficultyCommand,
  LightningStatsCommand,
  LightningTopCommand,
  MarketInfoCommand,
  MyAlertFeeCommand,
  MyAlertPriceCommand,
  MyAlertTxCommand,
  NodeStatsCommand,
  OpReturnCommand,
  TipCommand,
  TransactionCommand,
} from './commands'
import {
  BlockchainServiceRepository,
  LightningServiceRepository,
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
      useClass: CommandExceptionFilter,
    },
    BotMiddleware,
    BotService,

    // Data Providers
    BlockchainServiceRepository,
    LightningServiceRepository,
    MurrayServiceRepository,
    PricesServiceRepository,

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
    DifficultyCommand,
    FeesCommand,
    LightningStatsCommand,
    LightningTopCommand,
    MarketInfoCommand,
    MyAlertFeeCommand,
    MyAlertPriceCommand,
    MyAlertTxCommand,
    NodeStatsCommand,
    OpReturnCommand,
    TipCommand,
    TransactionCommand,

    // Helpers
    NumbersService,
  ],
})
export class BotModule {}
