import { Command, DiscordCommand } from '@discord-nestjs/core'
import { CommandInteraction } from 'discord.js'
import { Injectable } from '@nestjs/common'
import { LightningServiceRepository } from '../repositories'
import { NumbersService } from 'src/utils/numbers/numbers.service'
import { defaultResponse } from 'src/utils/default-response'

@Command({
  name: 'lightning-stats',
  description: 'Statistics about the Lightning Network',
})
@Injectable()
export class LightningStatsCommand implements DiscordCommand {
  constructor(
    private readonly lightningRepository: LightningServiceRepository,
    private readonly numbersService: NumbersService,
  ) {}

  async handler(interaction: CommandInteraction): Promise<{}> {
    const response = defaultResponse()
    const embed = response.embeds[0]
    const fields = embed.fields

    embed.title = '⚡ Lightning Network - Statistics'

    const { data } = await this.lightningRepository.getNetworkStatistics()

    const {
      node_count,
      clearnet_nodes,
      tor_nodes,
      channel_count,
      total_capacity,
      avg_capacity,
      avg_fee_rate,
      avg_base_fee_mtokens,
    } = data

    fields.push({
      name: '🖥️ Nodes',
      value: this.numbersService.formatterSATS.format(node_count),
      inline: true,
    })
    fields.push({
      name: '🤵‍♂️ Nodes Clearnet',
      value: this.numbersService.formatterSATS.format(clearnet_nodes),
      inline: true,
    })
    fields.push({
      name: '🕵️ Nodes Tor',
      value: this.numbersService.formatterSATS.format(tor_nodes),
      inline: true,
    })

    fields.push({
      name: '🔀 Channels',
      value: this.numbersService.formatterSATS.format(channel_count),
      inline: true,
    })
    fields.push({
      name: '🪫 Avg. Capacity',
      value: `${this.numbersService.formatterSATS.format(avg_capacity)} sats`,
      inline: true,
    })
    fields.push({
      name: '🪫 Total Capacity',
      value: `${this.numbersService.formatterSATS.format(total_capacity)} sats`,
      inline: true,
    })

    fields.push({
      name: '💸 Avg. Fee',
      value: `${this.numbersService.formatterSATS.format(avg_fee_rate)} ppm`,
      inline: true,
    })
    fields.push({
      name: '💸 Avg. Base Fee',
      value: `${this.numbersService.formatterSATS.format(avg_base_fee_mtokens)} msats`,
      inline: true,
    })
    fields.push({ name: '\u200B', value: '\u200B', inline: true })

    return response
  }
}
