import { TransformPipe } from '@discord-nestjs/common'
import {
  Command,
  DiscordTransformedCommand,
  Payload,
  TransformedCommandExecutionContext,
  UsePipes,
} from '@discord-nestjs/core'
import { Injectable } from '@nestjs/common'
import { LightningServiceRepository } from '../repositories'
import { NodeDto } from '../dto'
import { NumbersService } from 'src/utils/numbers/numbers.service'

@Command({
  name: 'node-stats',
  description: 'Show lightning node stats',
})
@UsePipes(TransformPipe)
@Injectable()
export class NodeStatsCommand implements DiscordTransformedCommand<NodeDto> {
  constructor(
    private readonly lightningRepository: LightningServiceRepository,
    private readonly numbersService: NumbersService,
  ) {}

  async handler(
    @Payload() dto: NodeDto,
    { interaction }: TransformedCommandExecutionContext,
  ): Promise<any> {
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

    const embed = response.embeds[0]
    const fields = embed.fields

    try {
      const { pubkey } = dto
      const { data } = await this.lightningRepository.getNode({ pubkey })

      const {
        public_key,
        alias,
        active_channel_count,
        capacity,
        first_seen,
        updated_at,
        iso_code,
        channels,
      } = data

      const format = this.numbersService.formatterSATS.format

      const flag = iso_code ? `:flag_${iso_code.toLowerCase()}:` : ''
      embed.title = `${flag} ${alias}`
      fields.push({ name: '🔑 Public Key', value: public_key })

      fields.push({ name: '🔀 Channels', value: format(active_channel_count), inline: true })
      fields.push({ name: '🪫 Capacity', value: `${format(capacity)} sats`, inline: true })
      fields.push({ name: '\u200B', value: '\u200B', inline: true })

      fields.push({ name: '👁️ First seen', value: `<t:${first_seen}:R>`, inline: true })
      fields.push({ name: '🗓️ Updated', value: `<t:${updated_at}:R>`, inline: true })
      fields.push({ name: '\u200B', value: '\u200B', inline: true })

      fields.push({ name: '\u200B', value: 'Top channels by capacity:' })

      const peers = channels.map(x => x.node.alias || '').join('\n')
      const capacities = channels.map(x => `${format(x.capacity)} sats`).join('\n')
      const fees = channels.map(x => `${format(x.fee_rate)} ppm`).join('\n')

      fields.push({ name: '👥 Peer', value: peers, inline: true })
      fields.push({ name: '🪫 Capacity', value: capacities, inline: true })
      fields.push({ name: '💸 Fee', value: fees, inline: true })
    } catch (err) {
      console.log(err)
      response.embeds[0].title = 'ERROR'
      response.embeds[0].description = 'Something went wrong'
    }

    return response
  }
}
