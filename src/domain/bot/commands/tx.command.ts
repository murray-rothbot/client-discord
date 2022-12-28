import { TransformPipe } from '@discord-nestjs/common'
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

@Command({
  name: 'tx',
  description: 'Information about a transaction',
})
@UsePipes(TransformPipe)
@Injectable()
export class TransactionCommand implements DiscordTransformedCommand<TransactionDto> {
  constructor(private readonly blockRepository: BlockchainServiceRepository) {}

  async handler(
    @Payload() dto: TransactionDto,
    { interaction }: TransformedCommandExecutionContext,
  ): Promise<any> {
    const response = {
      content: '',
      tts: false,
      embeds: [
        {
          type: 'rich',
          title: '',
          description: '',
          color: 0xff9900,
          timestamp: new Date(),
          fields: [],
          footer: {
            text: `Powered by Murray Rothbot`,
            icon_url: `https://murrayrothbot.com/murray-rothbot2.png`,
          },
        },
      ],
    }

    const fields = response.embeds[0].fields

    try {
      const { transaction } = dto

      const { data } = await this.blockRepository.getTransaction({ transaction })

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
        name: 'Transaction Hex:',
        value: `🔀 ${transaction}`,
      })

      fields.push({
        name: `📥 Inputs:`,
        value: `${vin.length ? vin.length : 0} (${
          vin_total ? vin_total?.toLocaleString() : 0
        } sats)`,
        inline: true,
      })
      fields.push({
        name: `📤 Outputs: `,
        value: `${vout.length} (${vout_total.toLocaleString()} sats)`,
        inline: true,
      })
      fields.push({
        name: `🪙 Fees: `,
        value: `${fees ? fees.toLocaleString() : 0} sats`,
        inline: true,
      })
      fields.push({
        name: `📏 Size:`,
        value: `${size.toLocaleString()} Bytes`,
        inline: true,
      })
      fields.push({
        name: `📦 Weight: `,
        value: `${weight.toLocaleString()} WU`,
        inline: true,
      })
      fields.push({
        name: `✅ Confirmed? `,
        value: `${confirmed} ${confirmed ? '' : rbf ? '(RBF)' : '(~~RBF~~)'}`,
        inline: true,
      })
    } catch (err) {
      console.error(err)

      response.embeds[0].title = 'ERROR'
      response.embeds[0].description = 'Something went wrong'
    }

    return response
  }
}
