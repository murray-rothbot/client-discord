import { Command, DiscordCommand } from '@discord-nestjs/core'
import { Injectable } from '@nestjs/common'
import { BlockchainServiceRepository } from '../repositories'
import { defaultResponse } from 'src/utils/default-response'
import { CommandInteraction } from 'discord.js'

@Command({
  name: 'my-alert-tx',
  description: 'List my transaction alerts.',
})
@Injectable()
export class MyAlertTxCommand implements DiscordCommand {
  constructor(private readonly blockchainServiceRepository: BlockchainServiceRepository) {}

  async handler(interaction: CommandInteraction): Promise<any> {
    const response = defaultResponse()
    const embed = response.embeds[0]
    const fields = embed.fields

    embed.title = '🗓️ Schedule Alert Transactions'

    const userId = interaction.user.id
    const data = await this.blockchainServiceRepository.listAlertTx({ userId })

    if (data === null) {
      throw new Error()
    }

    const alerts = data.data

    if (alerts.length === 0) {
      fields.push({
        name: 'No transaction alerts scheduled.',
        value: 'Use `/alert-tx` to schedule one.',
      })
    }

    for (const { txId, confirmationsAlert } of alerts) {
      if (alerts.length == 1) {
        fields.push({
          name: '🧬 Hash:',
          value: `[${txId}](https://mempool.space/tx/${txId})`,
        })
        fields.push({
          name: `✅ Waiting for how many confirmations?`,
          value: `${confirmationsAlert}`,
          inline: true,
        })
      } else {
        fields.push({
          name: `🧬 ${txId}`,
          value: `✅ Waiting for how many confirmations? ${confirmationsAlert}\n\u200b\n`,
          inline: false,
        })
      }
    }

    return response
  }
}
