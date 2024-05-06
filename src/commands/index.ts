import { CommandInteraction } from "discord.js";

import { deployFeesCommand, feesCommand } from "./_fees";
import { deployPricesCommand, pricesCommand } from "./_prices";
import { convertCommand, deployConvertCommand } from "./_convert";
import { deployDifficultyCommand, difficultyCommand } from "./_difficulty";
import {
  deployLightningStatsCommand,
  lightningStatsCommand,
} from "./_lightningStats";
import {
  deployLightningTopCommand,
  lightningTopCommand,
} from "./_lightningTop";
import { deployMarketCapCommand, marketCapCommand } from "./_marketCap";
import { NodeStatsCommand, deployNodeStatsCommand } from "./_nodeStats";
import { blockCommand, deployBlockCommand } from "./_block";
import { addressCommand, deployAddressCommand } from "./_address";
import { deployTransactionCommand, transactionCommand } from "./_transaction";

interface CommandHandlers {
  [key: string]: (interaction: CommandInteraction) => Promise<void>;
}

export const commands = {
  deployCommands: [
    deployConvertCommand(),
    deployDifficultyCommand(),
    deployFeesCommand(),
    deployPricesCommand(),
    deployLightningStatsCommand(),
    deployLightningTopCommand(),
    deployMarketCapCommand(),
    deployNodeStatsCommand(),
    deployBlockCommand(),
    deployAddressCommand(),
    deployTransactionCommand(),
  ],
  commands: {
    convert: convertCommand,
    difficulty: difficultyCommand,
    fees: feesCommand,
    prices: pricesCommand,
    "lightning-stats": lightningStatsCommand,
    "lightning-top": lightningTopCommand,
    "market-cap": marketCapCommand,
    "node-stats": NodeStatsCommand,
    block: blockCommand,
    address: addressCommand,
    transaction: transactionCommand,
  } as CommandHandlers,
};
