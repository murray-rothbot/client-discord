import { Command, DiscordCommand } from '@discord-nestjs/core'
import { CommandInteraction } from 'discord.js'
import { Injectable } from '@nestjs/common'
import { LightningServiceRepository } from '../repositories'
import { NumbersService } from 'src/utils/numbers/numbers.service'
import { defaultResponse } from 'src/utils/default-response'

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
    const response = defaultResponse()
    const embed = response.embeds[0]
    const fields = embed.fields

    embed.title = '⚡ Top Lightning Nodes'

    const { data } = await this.lightningRepository.getTopNodes()

    const byCapacity = data['topByCapacity']
    const byChannels = data['topByChannels']

    const medals = ['🥇', '🥈', '🥉']

    fields.push({ name: '\u200B', value: '_By capacity:_' })
    for (let i = 0; i < 3; i++) {
      fields.push({
        name: `${medals[i]} ${byCapacity[i]['alias']}`,
        value: `${this.numbersService.formatterSATS.format(byCapacity[i]['capacity'])} sats`,
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

    return response
  }
}
