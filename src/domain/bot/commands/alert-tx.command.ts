import { TransformPipe, ValidationPipe } from '@discord-nestjs/common'
import {
  Command,
  DiscordTransformedCommand,
  Payload,
  TransformedCommandExecutionContext,
  UsePipes,
} from '@discord-nestjs/core'
import { Injectable } from '@nestjs/common'
import { BlockchainServiceRepository } from '../repositories'
import { AlertTxDto } from '../dto/alert-tx.dto'
import { defaultResponse } from 'src/utils/default-response'

@Command({
  name: 'alert-tx',
  description: 'Create new transaction alert',
})
@UsePipes(TransformPipe, ValidationPipe)
@Injectable()
export class AlertTxCommand implements DiscordTransformedCommand<AlertTxDto> {
  constructor(private readonly blockchainRepository: BlockchainServiceRepository) {}

  async handler(
    @Payload() dto: AlertTxDto,
    { interaction }: TransformedCommandExecutionContext,
  ): Promise<any> {
    const response = defaultResponse()
    const embed = response.embeds[0]
    const fields = embed.fields

    embed.title = '🗓️ Schedule Alert Transaction'

    const { transaction, confirmations } = dto
    if (!confirmations) {
      dto.confirmations = 1
    }

    const userId = interaction.user.id
    await this.blockchainRepository.createAlertTx({
      userId,
      txId: transaction,
      confirmationsAlert: dto.confirmations,
    })

    fields.push({
      name: '🧬 Hash:',
      value: `[${transaction}](https://mempool.space/tx/${transaction})`,
    })
    fields.push({
      name: `✅ How many confirmations?`,
      value: `${dto.confirmations}`,
      inline: true,
    })

    return response
  }
}
