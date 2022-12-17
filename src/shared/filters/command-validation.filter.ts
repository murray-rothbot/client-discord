import { DiscordArgumentMetadata, DiscordExceptionFilter, Catch } from '@discord-nestjs/core'
import { Logger } from '@nestjs/common'
import { ValidationError } from 'class-validator'
import { Colors, EmbedBuilder } from 'discord.js'

@Catch(ValidationError)
export class CommandValidationFilter implements DiscordExceptionFilter {
  async catch(
    exceptionList: ValidationError[],
    metadata: DiscordArgumentMetadata<'interactionCreate'>,
  ): Promise<void> {
    const [interaction] = metadata.eventArgs

    const embeds = exceptionList.map((exception) =>
      new EmbedBuilder().setColor(Colors.Red).addFields(
        Object.values(exception.constraints).map((value) => ({
          name: exception.property,
          value,
        })),
      ),
    )

    Logger.error(JSON.stringify(exceptionList))
    if (interaction.isCommand()) await interaction.reply({ embeds })
  }
}
