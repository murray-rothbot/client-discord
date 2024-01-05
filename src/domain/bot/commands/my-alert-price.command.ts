import { Command, DiscordCommand } from '@discord-nestjs/core'
import { CommandInteraction } from 'discord.js'
import { createResponse, defaultResponse } from 'src/utils/default-response'
import { Injectable } from '@nestjs/common'
import { MurrayServiceRepository } from '../repositories'

@Command({
  name: 'price-alert-list',
  description: 'List my price alerts.',
  defaultMemberPermissions: ['UseApplicationCommands'],
})
@Injectable()
export class MyAlertPriceCommand implements DiscordCommand {
  constructor(private readonly repository: MurrayServiceRepository) {}

  async handler(interaction: CommandInteraction): Promise<any> {
    const userId = interaction.user.id
    const { data: alertInfo } = await this.repository.getPriceAlertList({ userId })

    alertInfo.fields.alerts.value = Object.keys(alertInfo.fields.alerts.value)
      .map(
        (k) =>
          `${alertInfo.fields.alerts.value[k].description} ${alertInfo.fields.alerts.value[k].value}`,
      )
      .join('\n')

    alertInfo.fields.current.value = Object.keys(alertInfo.fields.current.value)
      .map((k) => alertInfo.fields.current.value[k].value)
      .join('\n')

    return createResponse(alertInfo)
  }
}
