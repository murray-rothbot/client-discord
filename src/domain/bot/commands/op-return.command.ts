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
import * as QRCode from 'qrcode'
import { MurrayServiceRepository } from '../repositories'
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
    const opReturnBytes = new TextEncoder().encode(dto.opreturn_message).length
    const response = {
      tts: false,
      fetchReply: true,
      embeds: [
        {
          title: '',
          description: 'We need your help to keep the lights on!',
          color: 0xff9900,
          fields: [],
          author: {
            name: `Murray Rothbot - OP Return Service`,
            url: `https://murrayrothbot.com/`,
            icon_url: `https://murrayrothbot.com/murray-rothbot2.png`,
          },
          footer: {
            text: `Powered by Murray Rothbot`,
            icon_url: `https://murrayrothbot.com/murray-rothbot2.png`,
          },
        },
      ],
      files: [],
    }

    const embed = response.embeds[0]
    const fields = embed.fields

    if (modal.customId !== this.opReturnModalId) return

    fields.push({
      name: ':receipt: Bytes (max 80):',
      value: `${opReturnBytes} bytes`,
    })
    fields.push({
      name: ':newspaper2: Message:',
      value: `${dto.opreturn_message}`,
    })

    // validate bytes
    if (opReturnBytes > 80) {
      embed.color = 0xff0000
      embed.description = `Your message is too long. Please shorten it to 83 bytes or less.`

      await modal.reply(response)
      return
    }

    const invoice = await this.murrayRepository.getInvoiceOpReturn({
      message: dto.opreturn_message,
      user: modal.user,
    })

    if (invoice === null) {
      embed.title = 'ERROR'
      embed.description = 'We could not generate an invoice, try again later!'

      await modal.reply(response)
      return
    }

    const {
      data: { payment_request, num_satoshis },
    } = invoice

    fields.push({
      name: ':moneybag: Amount (sats):',
      value: `${num_satoshis} sats`,
    })
    fields.push({
      name: ':receipt: Payment Request:',
      value: `${payment_request}`,
    })

    const fileBuff = await QRCode.toDataURL(payment_request)
      .then((url: string) => {
        return Buffer.from(url.split(',')[1], 'base64')
      })
      .catch((err: any) => {
        console.error(err)
      })
    response.files = [fileBuff]

    await modal.reply(response)
  }
}
