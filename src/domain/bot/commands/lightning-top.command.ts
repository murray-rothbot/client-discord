import { Command, DiscordCommand } from '@discord-nestjs/core'
import { CommandInteraction } from 'discord.js'
import { Injectable } from '@nestjs/common'
import { MurrayServiceRepository } from '../repositories'
import { createResponse } from 'src/utils/default-response'

@Command({
  name: 'lightning-top',
  description: 'Top Lightning Nodes',
  defaultMemberPermissions: ['UseApplicationCommands'],
})
@Injectable()
export class LightningTopCommand implements DiscordCommand {
  constructor(private readonly murrayRepository: MurrayServiceRepository) {}

  async handler(interaction: CommandInteraction): Promise<{}> {
    const lnStatsTop = await this.murrayRepository.getLightingTop()
    return createResponse(lnStatsTop.data)
  }
}
