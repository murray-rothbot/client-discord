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

    const progressPercent = progressBar(difficultyInfo.data.fields.currentProgress.value / 100)
    difficultyInfo.data.fields.currentProgress.value = progressPercent

    const estimatedDate = difficultyInfo.data.fields.estimatedDate.value
    difficultyInfo.data.fields.estimatedDate.value = `<t:${Math.floor(estimatedDate / 1000)}:R>`
    difficultyInfo.data.fields.estimatedDate.inline = true
    difficultyInfo.data.fields.estimateChange.inline = true
    difficultyInfo.data.fields.previousChange.inline = true

    return createResponse(difficultyInfo.data)
  }
}
