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
import { BlockDto } from '../dto/block.dto'
import { defaultResponse } from 'src/utils/default-response'

@Command({
  name: 'block',
  description: 'Show bitcoin block stats',
})
@UsePipes(TransformPipe, ValidationPipe)
@Injectable()
export class BlockchainCommand implements DiscordTransformedCommand<BlockDto> {
  constructor(private readonly blockRepository: BlockchainServiceRepository) {}

  async handler(
    @Payload() dto: BlockDto,
    { interaction }: TransformedCommandExecutionContext,
  ): Promise<any> {
    const response = defaultResponse()
    const embed = response.embeds[0]
    const fields = embed.fields

    embed.title = '📦 Block Info'

    const request = {
      hash: dto.id && dto.id.length == 64 ? dto.id : null,
      height: dto.id && dto.id.length != 64 ? dto.id : null,
    }

    const { data } = await this.blockRepository.getBlock(request)

    if (!data) {
      throw [
        {
          property: 'block id',
          constraints: {
            isValid: 'block id mus by a valid block hash or height',
          },
        },
      ]
    }

    const { id, height, timestamp, difficulty, merkle_root, tx_count, size, weight } = data

    fields.push({ name: '🔗 Height', value: height.toLocaleString(), inline: true })
    fields.push({ name: '🗓️ TimeStamp', value: `<t:${timestamp}:R>`, inline: true })
    fields.push({ name: '🔀 Transaction count', value: tx_count.toLocaleString(), inline: true })
    fields.push({ name: '📏 Size', value: `${(size / 1e6).toLocaleString()} MB`, inline: true })
    fields.push({
      name: '⚖️ Weight',
      value: `${(weight / 1e6).toLocaleString()} MWU`,
      inline: true,
    })
    fields.push({ name: '🦾 Difficulty', value: difficulty.toLocaleString(), inline: true })

    fields.push({ name: '🧬 Hash', value: `[${id}](https://mempool.space/block/${id})` })
    fields.push({ name: '🌱 Merkle root', value: merkle_root })

    return response
  }
}
