import { Command, DiscordCommand } from '@discord-nestjs/core'
import { CommandInteraction } from 'discord.js'
import { Injectable } from '@nestjs/common'
import { MurrayServiceRepository } from '../repositories'
import { createResponse } from 'src/utils/default-response'

@Command({
  name: 'rank',
  description: 'Tip Rank',
})
@Injectable()
export class RankCommand implements DiscordCommand {
  constructor(private readonly repository: MurrayServiceRepository) {}

  async handler(interaction: CommandInteraction): Promise<{}> {
    const rank = await this.repository.getRank()

    return createResponse(rank.data)
  }
}
