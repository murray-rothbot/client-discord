import { Command, DiscordCommand } from '@discord-nestjs/core'
import { CommandInteraction } from 'discord.js'
import { Injectable } from '@nestjs/common'
import { BlockchainServiceRepository } from '../repositories'

@Command({
  name: 'fees',
  description: 'Recommend fees information',
})
@Injectable()
export class FeesCommand implements DiscordCommand {
  constructor(private readonly blockRepository: BlockchainServiceRepository) {}

  async handler(interaction: CommandInteraction): Promise<{}> {
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

    const vByte = (value) => `${value} sats/vByte`

    try {
      const {
        data: { fastestFee, halfHourFee, hourFee, economyFee, minimumFee },
      } = await this.blockRepository.getFee()

      fields.push({ name: '🐇 Fast', value: vByte(fastestFee), inline: true })
      fields.push({ name: '🐢 1/2 hour', value: vByte(halfHourFee), inline: true })
      fields.push({ name: '🦥 1 hour', value: vByte(hourFee), inline: true })
      fields.push({ name: '🪙 Economy', value: vByte(economyFee), inline: true })
      fields.push({ name: '🔻 Minimum', value: vByte(minimumFee), inline: true })
      fields.push({ name: '\u200B', value: '\u200B', inline: true })

      if (fastestFee == 1) {
        fields.push({
          name: 'Great moment to:',
          value: '* do a coinjoin\n* consolidate your utxos\n* open a lightning channel',
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
