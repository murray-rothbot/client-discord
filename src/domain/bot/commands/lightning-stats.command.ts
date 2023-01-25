import { Command, DiscordCommand } from '@discord-nestjs/core'
import { CommandInteraction } from 'discord.js'
import { Injectable } from '@nestjs/common'
import { LightningServiceRepository } from '../repositories'
import { NumbersService } from 'src/utils/numbers/numbers.service'

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
    const response = {
      content: '',
      tts: false,
      embeds: [
        {
          type: 'rich',
          title: '⚡ Lightning Network',
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
      const { data } = await this.lightningRepository.getNetworkStatistics()
      console.log(data)

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
        name: 'Nodes',
        value: this.numbersService.formatterSATS.format(node_count),
        inline: true,
      })
      fields.push({
        name: 'Nodes Clearnet',
        value: this.numbersService.formatterSATS.format(clearnet_nodes),
        inline: true,
      })
      fields.push({
        name: 'Nodes Tor',
        value: this.numbersService.formatterSATS.format(tor_nodes),
        inline: true,
      })

      fields.push({
        name: 'Channels',
        value: this.numbersService.formatterSATS.format(channel_count),
        inline: true,
      })
      fields.push({
        name: 'Avg. Capacity',
        value: `${this.numbersService.formatterSATS.format(avg_capacity)} sats`,
        inline: true,
      })
      fields.push({
        name: 'Total Capacity',
        value: `${this.numbersService.formatterSATS.format(total_capacity)} sats`,
        inline: true,
      })

      fields.push({
        name: 'Avg. Fee',
        value: `${this.numbersService.formatterSATS.format(avg_fee_rate)} ppm`,
        inline: true,
      })
      fields.push({
        name: 'Avg. Base Fee',
        value: `${this.numbersService.formatterSATS.format(avg_base_fee_mtokens)} msats`,
        inline: true,
      })
      fields.push({ name: '\u200B', value: '\u200B', inline: true })
    } catch (err) {
      console.error(err)

      response.embeds[0].title = 'ERROR'
      response.embeds[0].description = 'Something went wrong'
    }

    return response
  }
}
