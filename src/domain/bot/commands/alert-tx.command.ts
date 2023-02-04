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
    const { transaction, confirmations } = dto
    const { data: alertInfo } = await this.repository.createTransactionAlert({
      userId,
      transaction,
      confirmations,
    })

    return createResponse(alertInfo)
  }
}
