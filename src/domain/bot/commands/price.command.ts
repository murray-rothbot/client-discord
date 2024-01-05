import { Command, DiscordCommand } from '@discord-nestjs/core'
import { CommandInteraction } from 'discord.js'
import { Injectable } from '@nestjs/common'
import { MurrayServiceRepository } from '../repositories'
import { createResponse } from 'src/utils/default-response'

@Command({
  name: 'price',
  description: 'Show bitcoin fiat price',
  defaultMemberPermissions: ['UseApplicationCommands'],
})
@Injectable()
export class PriceCommand implements DiscordCommand {
  constructor(private readonly murrayRepository: MurrayServiceRepository) {}

  async handler(interaction: CommandInteraction): Promise<any> {
    const pricesInfo = await this.murrayRepository.getPrices()
    return createResponse(pricesInfo.data)
  }
}
