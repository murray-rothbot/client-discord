import { Command, DiscordCommand, On, Payload, UsePipes } from '@discord-nestjs/core'
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
import { MurrayServiceRepository } from '../repositories'
import { createResponse } from 'src/utils/default-response'

@Command({
  name: 'opreturn',
  description: 'Write data to the blockchain',
})
@Injectable()
export class OpReturnCommand implements DiscordCommand {
  private readonly logger = new Logger(OpReturnCommand.name)
  private readonly opReturnModalId = 'opreturnModal'
  private readonly msgComponentId = 'opreturn_message'

  constructor(private readonly murrayRepository: MurrayServiceRepository) {}

  async handler(interaction: CommandInteraction): Promise<void> {
    const modal = new ModalBuilder().setTitle('Op-Return Message').setCustomId(this.opReturnModalId)

    const msgInputComponent = new TextInputBuilder()
      .setCustomId(this.msgComponentId)
      .setLabel('Add your message here')
      .setMaxLength(80)
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
    if (modal.customId !== this.opReturnModalId) return

    // validate bytes
    const bytes = new TextEncoder().encode(dto.opreturn_message).length
    if (bytes > 80) {
      throw [
        {
          property: 'opreturn',
          constraints: {
            isValid: 'Your message is too long. Please shorten it to 80 bytes or less.',
          },
        },
      ]
    }

    const { opreturn_message: message } = dto
    const { user } = modal

    const invoiceInfo = await this.murrayRepository.getInvoiceOpReturn({
      message,
      user,
    })

    if (invoiceInfo === null) {
      throw [
        {
          property: 'opreturn',
          constraints: {
            isValid: 'We could not generate an invoice, try again later!',
          },
        },
      ]
    }

    const { data } = invoiceInfo
    const { paymentRequest } = data.fields
    const response = await createResponse({ ...data, qrCodeValue: paymentRequest.value })

    await modal.reply(response)
  }
}
