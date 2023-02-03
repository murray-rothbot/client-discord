import { Command, DiscordCommand } from '@discord-nestjs/core'
import { CommandInteraction } from 'discord.js'
import { Injectable } from '@nestjs/common'
import { MurrayServiceRepository } from '../repositories'
import { progressBar } from 'src/utils'
import { createResponse } from 'src/utils/default-response'

@Command({
  name: 'difficulty',
  description: 'Difficulty adjustment and hashrate information',
})
@Injectable()
export class DifficultyCommand implements DiscordCommand {
  constructor(private readonly murrayRepository: MurrayServiceRepository) {}

  async handler(interaction: CommandInteraction): Promise<any> {
    const difficultyInfo = await this.murrayRepository.getDifficulty()

    const barSize = 25
    const progressPercent = progressBar(
      Math.floor((difficultyInfo.data.fields.currentProgress.value / 100) * barSize),
      barSize,
    )
    difficultyInfo.data.fields.currentProgress.value = progressPercent

    const estimatedDate = difficultyInfo.data.fields.estimatedDate.value
    difficultyInfo.data.fields.estimatedDate.value = `<t:${Math.floor(estimatedDate / 1000)}:R>`

    return createResponse(difficultyInfo.data, (key, inline) => key !== 'currentProgress')
  }
}
