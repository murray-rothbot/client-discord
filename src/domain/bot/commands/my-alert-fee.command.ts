import { Command, DiscordCommand } from '@discord-nestjs/core'
import { CommandInteraction } from 'discord.js'
import { createResponse } from 'src/utils/default-response'
import { Injectable } from '@nestjs/common'
import { MurrayServiceRepository } from '../repositories'

@Command({
  name: 'fee-alert-list',
  description: 'List my fee alerts.',
})
@Injectable()
export class MyAlertFeeCommand implements DiscordCommand {
  constructor(private readonly repository: MurrayServiceRepository) {}

  async handler(interaction: CommandInteraction): Promise<any> {
    const userId = interaction.user.id
    const { data: alertInfo } = await this.repository.getFeeAlertList({ userId })

    alertInfo.fields.alerts.value = Object.keys(alertInfo.fields.alerts.value)
      .map((k) => alertInfo.fields.alerts.value[k].description)
      .join('\n')

    return createResponse(alertInfo)
  }
}
