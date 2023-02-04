import { Command, DiscordCommand } from '@discord-nestjs/core'
import { CommandInteraction } from 'discord.js'
import { Injectable } from '@nestjs/common'
import { MurrayServiceRepository } from '../repositories'
import { createResponse } from 'src/utils/default-response'

@Command({
  name: 'lightning-stats',
  description: 'Statistics about the Lightning Network',
})
@Injectable()
export class LightningStatsCommand implements DiscordCommand {
  constructor(private readonly murrayRepository: MurrayServiceRepository) {}

  async handler(interaction: CommandInteraction): Promise<{}> {
    const lnStatsInfo = await this.murrayRepository.getLightingStatistics()
    lnStatsInfo.data.fields.blank = { description: '\u200B', value: '\u200B' }
    return createResponse(lnStatsInfo.data, (key, inline) => true)
  }
}
