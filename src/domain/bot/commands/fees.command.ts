import { Command, DiscordCommand } from '@discord-nestjs/core'
import { CommandInteraction } from 'discord.js'
import { Injectable } from '@nestjs/common'
import { MurrayServiceRepository } from '../repositories'
import { createResponse } from 'src/utils/default-response'

@Command({
  name: 'fees',
  description: 'Recommend fees information',
  defaultMemberPermissions: ['UseApplicationCommands'],
})
@Injectable()
export class FeesCommand implements DiscordCommand {
  constructor(private readonly repository: MurrayServiceRepository) {}

  async handler(interaction: CommandInteraction): Promise<{}> {
    const feesInfo = await this.repository.getFee()

    const keys: any[] = Object.keys(feesInfo.data.fields)
    feesInfo.data.fields = keys.reduce((obj, key, index) => {
      obj[key] = feesInfo.data.fields[key]
      if (key == 'economy') obj[`blank${index}`] = { description: '\u200B', value: '\u200B' }
      return obj
    }, {})

    return createResponse(feesInfo.data, (key, inline) => key !== 'tip')
  }
}
