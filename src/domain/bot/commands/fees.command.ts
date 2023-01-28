import { Command, DiscordCommand } from '@discord-nestjs/core'
import { CommandInteraction } from 'discord.js'
import { Injectable } from '@nestjs/common'
import { BlockchainServiceRepository } from '../repositories'
import { defaultResponse } from 'src/utils/default-response'

@Command({
  name: 'fees',
  description: 'Recommend fees information',
})
@Injectable()
export class FeesCommand implements DiscordCommand {
  constructor(private readonly blockRepository: BlockchainServiceRepository) {}

  async handler(interaction: CommandInteraction): Promise<{}> {
    const response = defaultResponse()
    const embed = response.embeds[0]
    const fields = embed.fields

    embed.title = '💸 Network Fees'

    const {
      data: { fastestFee, halfHourFee, hourFee, economyFee, minimumFee },
    } = await this.blockRepository.getFee()

    const vByte = (value) => `${value} sats/vByte`

    fields.push({ name: '🐇 Fast', value: vByte(fastestFee), inline: true })
    fields.push({ name: '🐢 1/2 hour', value: vByte(halfHourFee), inline: true })
    fields.push({ name: '🦥 1 hour', value: vByte(hourFee), inline: true })
    fields.push({ name: '🪙 Economy', value: vByte(economyFee), inline: true })
    fields.push({ name: '🔻 Minimum', value: vByte(minimumFee), inline: true })
    fields.push({ name: '\u200B', value: '\u200B', inline: true })

    if (fastestFee == 1) {
      fields.push({
        name: '\u200B\nGreat moment to:',
        value: '* Do a coinjoin\n* Consolidate your UTXOs\n* Open a Lightning Channel',
        inline: false,
      })
    }

    return response
  }
}
