import { Command, DiscordCommand } from '@discord-nestjs/core'
import { CommandInteraction } from 'discord.js'
import { createResponse } from 'src/utils/default-response'
import { Injectable } from '@nestjs/common'
import { MurrayServiceRepository } from '../repositories'

@Command({
  name: 'transaction-alert-list',
  description: 'List my transaction alerts.',
  defaultMemberPermissions: ['UseApplicationCommands'],
})
@Injectable()
export class MyAlertTxCommand implements DiscordCommand {
  constructor(private readonly repository: MurrayServiceRepository) {}

  async handler(interaction: CommandInteraction): Promise<any> {
    const userId = interaction.user.id

    const { data: alertInfo } = await this.repository.getTransactionAlertList({ userId })

    const multiple = Object.keys(alertInfo.fields).length > 1

    // return createResponse(alertInfo)
    interaction.user.send(await createResponse(alertInfo))
    return 'Private command: I sent you a direct message.'
  }
}
