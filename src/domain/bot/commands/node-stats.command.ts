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
import { NodeDto } from '../dto'
import { createResponse } from 'src/utils/default-response'

@Command({
  name: 'node-stats',
  description: 'Show lightning node stats',
  defaultMemberPermissions: ['UseApplicationCommands'],
})
@UsePipes(TransformPipe, ValidationPipe)
@Injectable()
export class NodeStatsCommand implements DiscordTransformedCommand<NodeDto> {
  constructor(private readonly murrayRepository: MurrayServiceRepository) {}

  async handler(
    @Payload() dto: NodeDto,
    { interaction }: TransformedCommandExecutionContext,
  ): Promise<any> {
    const { data: nodeInfo } = await this.murrayRepository.getLightingNode({ pubkey: dto.pubkey })

    if (!nodeInfo) {
      throw [
        {
          property: 'node pubkey',
          constraints: {
            isValid: 'pubkey must be a valid node',
          },
        },
      ]
    }

    const keys: any[] = Object.keys(nodeInfo.fields)
    nodeInfo.fields = keys.reduce((obj, key, index) => {
      obj[key] = nodeInfo.fields[key]
      if (['capacity', 'updated'].includes(key))
        obj[`blank${index}`] = { description: '\u200B', value: '\u200B' }
      return obj
    }, {})

    return createResponse(nodeInfo, (key, inline) => !['pubkey', 'topChannels'].includes(key))
  }
}
