import { Command, DiscordCommand } from '@discord-nestjs/core'
import { CommandInteraction } from 'discord.js'
import { Injectable } from '@nestjs/common'
import { MurrayServiceRepository } from '../repositories'
import { createResponse } from 'src/utils/default-response'

@Command({
  name: 'fees',
  description: 'Recommend fees information',
})
@Injectable()
export class FeesCommand implements DiscordCommand {
  constructor(private readonly repository: MurrayServiceRepository) {}

  async handler(interaction: CommandInteraction): Promise<{}> {
    const feesInfo = await this.repository.getFee()

    feesInfo.data.fields.fastestFee.inline = true
    feesInfo.data.fields.halfHourFee.inline = true
    feesInfo.data.fields.hourFee.inline = true
    feesInfo.data.fields.economy.inline = true
    feesInfo.data.fields.minimum.inline = true

    return createResponse(feesInfo.data)
  }
}
