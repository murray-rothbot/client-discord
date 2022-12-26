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
import { BlockDto } from '../dto/block.dto'
import { ICommandResponse } from '../interfaces/command.interface'

@Command({
  name: 'block',
  description: 'Show bitcoin block stats',
})
@UsePipes(TransformPipe)
@Injectable()
export class BlockchainCommand implements DiscordTransformedCommand<BlockDto> {
  constructor(private readonly blockRepository: BlockchainServiceRepository) {}

  async handler(
    @Payload() dto: BlockDto,
    { interaction }: TransformedCommandExecutionContext,
  ): Promise<ICommandResponse> {
    const response = {
      content: '',
      tts: false,
      embeds: [
        {
          type: 'rich',
          title: 'Block Info',
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
      const request = {
        hash: dto.id && dto.id.length == 64 ? dto.id : null,
        height: dto.id && dto.id.length != 64 ? dto.id : null,
      }

      const data = await this.blockRepository.getBlock(request)
      const { id, height, timestamp, difficulty, merkle_root, tx_count, size, weight } = data.data

      // response.embeds[0].fields.push({ name: '⛓️ Last Block Info', value: '\u200B' })

      fields.push({ name: 'Height', value: height.toLocaleString(), inline: true })
      fields.push({ name: 'TimeStamp', value: `<t:${timestamp}:R>`, inline: true })
      fields.push({ name: 'Transaction count', value: tx_count.toLocaleString(), inline: true })
      fields.push({ name: 'Size', value: `${(size / 1e6).toLocaleString()} MB`, inline: true })
      fields.push({ name: 'Weight', value: `${(weight / 1e6).toLocaleString()} MWU`, inline: true })
      fields.push({ name: 'Difficulty', value: difficulty.toLocaleString(), inline: true })

      fields.push({ name: 'Hash', value: id })
      fields.push({ name: 'Merkle root', value: merkle_root })
    } catch {
      response.embeds[0].title = 'ERROR'
      response.embeds[0].description = 'Something went wrong'
    }

    return response
  }
}
