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
import { TransactionDto } from '../dto'
import { createResponse } from 'src/utils/default-response'

@Command({
  name: 'tx',
  description: 'Information about a transaction',
})
@UsePipes(TransformPipe, ValidationPipe)
@Injectable()
export class TransactionCommand implements DiscordTransformedCommand<TransactionDto> {
  constructor(private readonly repository: MurrayServiceRepository) {}

  async handler(
    @Payload() dto: TransactionDto,
    { interaction }: TransformedCommandExecutionContext,
  ): Promise<any> {
    const { transaction } = dto
    const txInfo = await this.repository.getTransaction({ transaction })

    if (!txInfo) {
      throw [
        {
          property: 'transaction id',
          constraints: {
            isValid: 'transaction id must be valid',
          },
        },
      ]
    }

    txInfo.data.fields.inputs.inline = true
    txInfo.data.fields.outputs.inline = true
    txInfo.data.fields.fees.inline = true
    txInfo.data.fields.size.inline = true
    txInfo.data.fields.weight.inline = true
    txInfo.data.fields.confirmed.inline = true

    const confirmed = txInfo.data.fields.confirmed.value
    if (confirmed) {
      const rbf = txInfo.data.fields.rbf.value
      txInfo.data.fields.confirmed.value += `${rbf ? ' (RBF)' : ' (~~RBF~~)'}`
    }

    delete txInfo.data.fields.rbf

    return createResponse(txInfo.data)
  }
}
