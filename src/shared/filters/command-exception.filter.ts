import { DiscordArgumentMetadata, DiscordExceptionFilter, Catch } from '@discord-nestjs/core'
import { Logger } from '@nestjs/common'

import {
  BlockchainServiceRepository,
  MurrayServiceRepository,
  PricesServiceRepository,
} from 'src/domain/bot/repositories'
import { defaultResponse } from 'src/utils/default-response'

@Catch()
export class CommandExceptionFilter implements DiscordExceptionFilter {
  constructor(
    private readonly blockchainRepository: BlockchainServiceRepository,
    private readonly murrayRepository: MurrayServiceRepository,
    private readonly pricesRepository: PricesServiceRepository,
  ) {}

  async catch(
    exceptionList: any[],
    metadata: DiscordArgumentMetadata<'interactionCreate'>,
  ): Promise<void> {
    Logger.error(exceptionList)

    const [interaction] = metadata.eventArgs

    const response = defaultResponse()

    const embed = response.embeds[0]
    embed.title = 'ERROR'

    const fields = embed.fields

    try {
      for (const exception of exceptionList) {
        for (const value of Object.values(exception.constraints)) {
          fields.push({ name: `⚠️ ${exception.property}`, value })
        }
      }
    } catch {}

    if (!fields.length) {
      embed.description = 'Something went wrong'

      embed.image = {
        url: 'https://media.tenor.com/mF4tqeOq3mYAAAAC/bicentennial-man-robin-williams.gif',
      }

      try {
        const services = [
          ['Blockchain', this.blockchainRepository],
          ['Murray', this.murrayRepository],
          ['Prices', this.pricesRepository],
        ]

        const results = await Promise.all(services.map((x) => health(x[0], x[1])))
        fields.push({ name: 'Service', value: results.map((x) => x[0]).join('\n'), inline: true })
        fields.push({
          name: 'Status',
          value: results.map((x) => (x[1] ? '🟢' : '🔴')).join('\n'),
          inline: true,
        })
      } catch (err) {}
    }

    if (interaction.isCommand()) await interaction.reply(response)
  }
}

async function health(name, repository) {
  const response = await repository.getHealth()

  return [name, response?.data?.message == 'OK']
}
