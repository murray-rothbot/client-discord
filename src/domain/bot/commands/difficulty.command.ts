import { Command, DiscordCommand } from '@discord-nestjs/core'
import { CommandInteraction } from 'discord.js'
import { Injectable } from '@nestjs/common'
import { BlockchainServiceRepository } from '../repositories'
import { progressBar } from 'src/utils'

@Command({
  name: 'difficulty',
  description: 'Difficulty adjustment and hashrate information',
})
@Injectable()
export class DifficultyCommand implements DiscordCommand {
  constructor(private readonly blockRepository: BlockchainServiceRepository) {}

  async handler(interaction: CommandInteraction): Promise<{}> {
    const response = {
      content: '',
      tts: false,
      embeds: [
        {
          type: 'rich',
          title: 'Next Difficult Adjustment',
          description:
            'In order to ensure bitcoin blocks are discovered roughly every 10 minutes, an automatic system is in place to adjust the difficulty every 2016 blocks depending on how many miners are competing to discover blocks at any given time.',
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
      const data = await this.blockRepository.getHashrate()

      const {
        data: {
          remainingBlocks,
          progressPercent,
          estimatedRetargetDate,
          difficultyChange,
          previousRetarget,
        },
      } = data

      const arrow = (value) => (value > 0 ? '🔼' : '🔽')
      const change = (value) => `${arrow(value)} ${value.toFixed(2)}%`

      fields.push({
<<<<<<< HEAD
        name: `🏁 Current Progress - ${2016 - remainingBlocks}/2016 blocks`,
        value: progressBar(progressPercent / 100),
      })
      fields.push({
        name: '🗓️ Estimated Date',
=======
        name: `Current Progress - ${2016 - remainingBlocks}/2016 blocks`,
        value: progressBar(progressPercent / 100),
      })
      fields.push({
        name: 'Estimated Date',
>>>>>>> d804e82 (feat: command difficulty)
        value: `<t:${Math.floor(estimatedRetargetDate / 1000)}:R>`,
        inline: true,
      })
      fields.push({
        name: 'Estimated Change',
        value: change(difficultyChange),
        inline: true,
      })
      fields.push({
        name: 'Previous Change',
        value: change(previousRetarget),
        inline: true,
      })
    } catch (err) {
      console.error(err)

      response.embeds[0].title = 'ERROR'
      response.embeds[0].description = 'Something went wrong'
    }

    return response
  }
}
