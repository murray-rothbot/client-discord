import { DiscordArgumentMetadata, DiscordExceptionFilter, Catch } from '@discord-nestjs/core'
import { Logger } from '@nestjs/common'
import { defaultResponse } from 'src/utils/default-response'

@Catch()
export class CommandExceptionFilter implements DiscordExceptionFilter {
  constructor() {}

  async catch(
    exceptionList: any,
    metadata: DiscordArgumentMetadata<'interactionCreate'>,
  ): Promise<void> {
    try {
      for (const exception of exceptionList) {
        Logger.error(JSON.stringify(exception))
      }
    } catch {
      Logger.error(JSON.stringify(exceptionList))
    }

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

    embed.description = 'Something went wrong'

    embed.image = {
      url: 'https://media.tenor.com/mF4tqeOq3mYAAAAC/bicentennial-man-robin-williams.gif',
    }

    if (interaction.isCommand()) await interaction.reply(response)
  }
}
