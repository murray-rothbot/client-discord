import { Command, DiscordCommand, On, Payload, UsePipes } from '@discord-nestjs/core'
import { codeBlock } from '@discordjs/formatters'
import { Injectable, Logger, UseGuards } from '@nestjs/common'
import {
  ActionRowBuilder,
  CommandInteraction,
  ModalActionRowComponentBuilder,
  ModalBuilder,
  ModalSubmitInteraction,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js'
import { IsModalInteractionGuard } from '../../../shared/guards/modal-interaction.guard'
import { ModalFieldsTransformPipe } from '../../../shared/pipes/modal.fields.transform.pipe'
import { OpReturnDTO } from '../dto/opreturn.dto'

@Command({
  name: 'opreturn',
  description: 'Write data to the blockchain',
})
@Injectable()
export class OpReturnCommand implements DiscordCommand {
  private readonly logger = new Logger(OpReturnCommand.name)
  private readonly opReturnModalId = 'opreturnModal'
  private readonly msgComponentId = 'opreturn_message'

  async handler(interaction: CommandInteraction): Promise<void> {
    const modal = new ModalBuilder().setTitle('Opreturn Message').setCustomId(this.opReturnModalId)

    const msgInputComponent = new TextInputBuilder()
      .setCustomId(this.msgComponentId)
      .setLabel('Add your message here')
      .setMaxLength(100)
      .setStyle(TextInputStyle.Paragraph)

    const rows = [msgInputComponent].map((component) =>
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(component),
    )

    modal.addComponents(...rows)

    await interaction.showModal(modal)
  }

  @On('interactionCreate')
  @UsePipes(ModalFieldsTransformPipe)
  @UseGuards(IsModalInteractionGuard)
  async onModuleSubmit(@Payload() dto: OpReturnDTO, modal: ModalSubmitInteraction) {
    this.logger.log(dto)
    this.logger.log(`Modal ${modal.customId} submit`)

    if (modal.customId !== this.opReturnModalId) return

    await modal.reply(
      `Your message has been submitted.` + codeBlock('markdown', dto.opreturn_message),
    )
  }
}
