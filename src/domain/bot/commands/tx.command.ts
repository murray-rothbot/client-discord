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
import { TransactionDto } from '../dto'
import { defaultResponse } from 'src/utils/default-response'

@Command({
  name: 'tx',
  description: 'Information about a transaction',
})
@UsePipes(TransformPipe, ValidationPipe)
@Injectable()
export class TransactionCommand implements DiscordTransformedCommand<TransactionDto> {
  constructor(private readonly blockRepository: BlockchainServiceRepository) {}

  async handler(
    @Payload() dto: TransactionDto,
    { interaction }: TransformedCommandExecutionContext,
  ): Promise<any> {
    const response = defaultResponse()
    const embed = response.embeds[0]
    const fields = embed.fields

    embed.title = '🔀 Transaction'

    const { transaction } = dto
    const { data } = await this.blockRepository.getTransaction({ transaction })

    if (!data) {
      throw [
        {
          property: 'transaction id',
          constraints: {
            isValid: 'transaction id must be valid',
          },
        },
      ]
    }

    const {
      vin,
      vout,
      size,
      weight,
      status: { confirmed, block_hash, block_time },
    } = data

    const vin_total = vin.reduce((total, num) => total + num.prevout?.value, 0)
    const vout_total = vout.reduce((total, num) => total + num?.value, 0)
    const fees = vin_total - vout_total

    const rbf = vin.some((v) => v.sequence < 0xfffffffe)

    fields.push({
      name: '🧬 Hash:',
      value: `[${transaction}](https://mempool.space/tx/${transaction})`,
    })

    fields.push({
      name: `📥 Inputs:`,
      value: `${vin.length ? vin.length : 0} (${vin_total ? vin_total?.toLocaleString() : 0} sats)`,
      inline: true,
    })
    fields.push({
      name: `📤 Outputs: `,
      value: `${vout.length} (${vout_total.toLocaleString()} sats)`,
      inline: true,
    })
    fields.push({
      name: `💸 Fees: `,
      value: `${fees ? fees.toLocaleString() : 0} sats`,
      inline: true,
    })
    fields.push({
      name: `📏 Size:`,
      value: `${size.toLocaleString()} Bytes`,
      inline: true,
    })
    fields.push({
      name: `⚖️ Weight: `,
      value: `${weight.toLocaleString()} WU`,
      inline: true,
    })
    fields.push({
      name: `✅ Confirmed? `,
      value: `${confirmed} ${confirmed ? '' : rbf ? '(RBF)' : '(~~RBF~~)'}`,
      inline: true,
    })

    return response
  }
}
