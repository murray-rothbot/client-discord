import { Command, DiscordCommand } from '@discord-nestjs/core'
import { CommandInteraction } from 'discord.js'
import { Injectable } from '@nestjs/common'
import { LightningServiceRepository } from '../repositories'
import { NumbersService } from 'src/utils/numbers/numbers.service'

@Command({
  name: 'lightning-top',
  description: 'Top Lightning Nodes',
})
@Injectable()
export class LightningTopCommand implements DiscordCommand {
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
          title: '⚡ Top Lightning Nodes',
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
      const { data } = await this.lightningRepository.getTopNodes()
      console.log(data)

      const byCapacity = data['topByCapacity']
      const byChannels = data['topByChannels']

      const medals = ['🥇', '🥈', '🥉']

      fields.push({ name: '\u200B', value: '_By capacity:_' })
      for (let i = 0; i < 3; i++) {
        fields.push({
          name: `${medals[i]} ${byCapacity[i]['alias']}`,
          value: `⚡${this.numbersService.formatterSATS.format(byCapacity[i]['capacity'])}`,
          inline: false,
        })
      }

      fields.push({ name: '\u200B', value: '_By channels count:_' })
      for (let i = 0; i < 3; i++) {
        fields.push({
          name: `${medals[i]} ${byChannels[i]['alias']}`,
          value: `${this.numbersService.formatterSATS.format(byChannels[i]['channels'])} channels`,
          inline: false,
        })
      }
    } catch (err) {
      console.error(err)

      response.embeds[0].title = 'ERROR'
      response.embeds[0].description = 'Something went wrong'
    }

    return response
  }
}
