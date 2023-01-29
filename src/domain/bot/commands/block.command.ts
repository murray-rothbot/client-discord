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
import { BlockDto } from '../dto/block.dto'
import { createResponse } from 'src/utils/default-response'

@Command({
  name: 'block',
  description: 'Show bitcoin block stats',
})
@UsePipes(TransformPipe, ValidationPipe)
@Injectable()
export class BlockchainCommand implements DiscordTransformedCommand<BlockDto> {
  constructor(private readonly murrayRepository: MurrayServiceRepository) {}

  async handler(
    @Payload() dto: BlockDto,
    { interaction }: TransformedCommandExecutionContext,
  ): Promise<any> {
    const payload = {
      hash: dto.id && dto.id.length === 64 ? dto.id : null,
      height: dto.id && dto.id.length < 64 ? dto.id : null,
    }
    const blockInfo = await this.murrayRepository.getBlock(payload)

    if (!blockInfo) {
      throw [
        {
          property: 'block id',
          constraints: {
            isValid: 'block id must by a valid block hash or height',
          },
        },
      ]
    }

    blockInfo.data.fields.height.inline = true
    blockInfo.data.fields.timestamp.inline = true
    blockInfo.data.fields.txCount.inline = true
    blockInfo.data.fields.size.inline = true
    blockInfo.data.fields.weight.inline = true
    blockInfo.data.fields.difficulty.inline = true

    return createResponse(blockInfo.data)
  }
}
