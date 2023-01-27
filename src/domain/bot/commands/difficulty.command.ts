import { Command, DiscordCommand } from '@discord-nestjs/core'
import { CommandInteraction } from 'discord.js'
import { Injectable } from '@nestjs/common'
import { BlockchainServiceRepository } from '../repositories'
import { progressBar } from 'src/utils'
import { defaultResponse } from 'src/utils/default-response'

@Command({
  name: 'difficulty',
  description: 'Difficulty adjustment and hashrate information',
})
@Injectable()
export class DifficultyCommand implements DiscordCommand {
  constructor(private readonly blockRepository: BlockchainServiceRepository) {}

  async handler(interaction: CommandInteraction): Promise<any> {
    const response = defaultResponse()
    const embed = response.embeds[0]
    const fields = embed.fields

    embed.title = '🦾 Next Difficult Adjustment'
    embed.description =
      'In order to ensure bitcoin blocks are discovered roughly every 10 minutes, an automatic system is in place to adjust the difficulty every 2016 blocks depending on how many miners are competing to discover blocks at any given time.'

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
      name: `🏁 Current Progress - ${2016 - remainingBlocks}/2016 blocks`,
      value: progressBar(progressPercent / 100),
    })
    fields.push({
      name: '🗓️ Estimated Date',
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

    return response
  }
}
