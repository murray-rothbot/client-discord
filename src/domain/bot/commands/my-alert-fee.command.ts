import { Command, DiscordCommand } from '@discord-nestjs/core'
import { Injectable } from '@nestjs/common'
import { BlockchainServiceRepository } from '../repositories'
import { defaultResponse } from 'src/utils/default-response'
import { CommandInteraction } from 'discord.js'

@Command({
  name: 'my-alert-fee',
  description: 'List my fee alerts.',
})
@Injectable()
export class MyAlertFeeCommand implements DiscordCommand {
  constructor(private readonly blockchainRepository: BlockchainServiceRepository) {}

  async handler(interaction: CommandInteraction): Promise<any> {
    const response = defaultResponse()
    const embed = response.embeds[0]
    const fields = embed.fields

    embed.title = `🗓️ Schedule Alert Fees`

    const userId = interaction.user.id
    const { data: alerts } = await this.blockchainRepository.listAlertFee({ userId })

    const description = []

    if (alerts.length == 0) {
      fields.push({
        name: 'No fee alerts scheduled.',
        value: 'Use `/alert-fee` to schedule one.',
      })
    } else if (alerts.length > 1) {
      description.push(
        'You will receive an alert when the fee reaches\n**Lower or equal then:**\n\n',
      )
    }

    for (const data of alerts) {
      if (alerts.length == 1) {
        fields.push({
          name: 'You will receive an alert when the fee reaches',
          value: `**\nLower or equal then:\n⬇️ ${data.fee} sats/vByte\n**`,
        })
      } else {
        description.push(`⬇️ ${data.fee} sats/vByte\n`)
      }
    }
    if (alerts.length > 1) {
      embed.description = description.join('')
    }

    return response
  }
}
