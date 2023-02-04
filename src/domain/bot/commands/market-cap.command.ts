import { Command, DiscordCommand } from '@discord-nestjs/core'
import { CommandInteraction } from 'discord.js'
import { Injectable } from '@nestjs/common'
import { MurrayServiceRepository } from '../repositories'
import { createResponse } from 'src/utils/default-response'
import { group } from 'console'

@Command({
  name: 'market-cap',
  description: 'Market capitalization information',
})
@Injectable()
export class MarketCapCommand implements DiscordCommand {
  constructor(private readonly murrayRepository: MurrayServiceRepository) {}

  async handler(interaction: CommandInteraction): Promise<any> {
    const { data: marketInfo } = await this.murrayRepository.getMarketCap()

    return createResponse(marketInfo, (key, inline) => {
      return true
    })
  }
}
