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
import { AddressDto } from '../dto'

@Command({
  name: 'address',
  description: 'Information about an address',
})
@UsePipes(TransformPipe)
@Injectable()
export class AddressCommand implements DiscordTransformedCommand<AddressDto> {
  constructor(private readonly blockRepository: BlockchainServiceRepository) {}

  async handler(
    @Payload() dto: AddressDto,
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
      const { address } = dto
      response.embeds[0].title = `🪧 ${address}`

      const data = await this.blockRepository.getAddress({ address })

      var {
        chain_stats: { funded_txo_count, funded_txo_sum, spent_txo_count, spent_txo_sum },
      } = data.data

      fields.push({ name: '\u200B', value: 'On chain transactions:' })
      fields.push({
        name: `📥 Received: ${funded_txo_count}`,
        value: `Total: ${funded_txo_sum} sats`,
        inline: true,
      })
      fields.push({
        name: `📤 Sent: ${spent_txo_count}`,
        value: `Total: ${spent_txo_sum} sats`,
        inline: true,
      })

      var {
        mempool_stats: { funded_txo_count, funded_txo_sum, spent_txo_count, spent_txo_sum },
      } = data.data

      fields.push({ name: '\u200B', value: 'Mempool transactions:' })
      fields.push({
        name: `📥 Received: ${funded_txo_count}`,
        value: `Total: ${funded_txo_sum} sats`,
        inline: true,
      })
      fields.push({
        name: `📤 Sent: ${spent_txo_count}`,
        value: `Total: ${spent_txo_sum} sats`,
        inline: true,
      })

      console.log(data.data)
    } catch (err) {
      console.error(err)
      response.embeds[0].title = 'ERROR'
      response.embeds[0].description = 'Something went wrong'
    }

    return response
  }
}
