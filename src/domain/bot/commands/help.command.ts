import { Command, DiscordCommand } from '@discord-nestjs/core'
import { CommandInteraction } from 'discord.js'
import { Injectable } from '@nestjs/common'

@Command({
  name: 'help',
  description: 'Show list of commands',
})
@Injectable()
export class HelpCommand implements DiscordCommand {
  handler(interaction: CommandInteraction): string {
    return 'Here are your commands...'
  }
}
