import { TransformPipe, ValidationPipe } from '@discord-nestjs/common'
import {
  Command,
  DiscordTransformedCommand,
  Payload,
  TransformedCommandExecutionContext,
  UsePipes,
} from '@discord-nestjs/core'
import { Injectable } from '@nestjs/common'
import { MurrayServiceRepository } from '../repositories'
import { AlertTxDto } from '../dto/alert-tx.dto'
import { createResponse } from 'src/utils/default-response'

@Command({
  name: 'transaction-alert',
  description: 'Create new transaction alert',
  defaultMemberPermissions: ['UseApplicationCommands'],
})
@UsePipes(TransformPipe, ValidationPipe)
@Injectable()
export class AlertTxCommand implements DiscordTransformedCommand<AlertTxDto> {
  constructor(private readonly repository: MurrayServiceRepository) {}

  async handler(
    @Payload() dto: AlertTxDto,
    { interaction }: TransformedCommandExecutionContext,
  ): Promise<any> {
    const userId = interaction.user.id
    const { txId, confirmations } = dto
    const { data: alertInfo } = await this.repository.createTransactionAlert({
      userId,
      txId,
      confirmations,
    })

    interaction.user.send(await createResponse(alertInfo))
    return 'Private command: I sent you a direct message.'
  }
}
