import { TransformPipe, ValidationPipe } from '@discord-nestjs/common'
import {
  Command,
  DiscordTransformedCommand,
  Payload,
  TransformedCommandExecutionContext,
  UsePipes,
} from '@discord-nestjs/core'
import { Injectable } from '@nestjs/common'
import { MurrayServiceRepository } from '../repositories'
import { TipDto } from '../dto'
import * as QRCode from 'qrcode'
import { NumbersService } from 'src/utils/numbers/numbers.service'
import { defaultResponse } from 'src/utils/default-response'
import { Attachment, AttachmentBuilder } from 'discord.js'

@Command({
  name: 'tip',
  description: 'Send a tip to Murray Rothbot! We need your help to keep the lights on!',
})
@UsePipes(TransformPipe, ValidationPipe)
@Injectable()
export class TipCommand implements DiscordTransformedCommand<TipDto> {
  constructor(
    private readonly murrayRepository: MurrayServiceRepository,
    private readonly numbersService: NumbersService,
  ) {}

  async handler(
    @Payload() dto: TipDto,
    { interaction }: TransformedCommandExecutionContext,
  ): Promise<any> {
    const response = defaultResponse()
    const embed = response.embeds[0]
    const fields = embed.fields

    embed.title = '🪙 Tip Murray Rothbot with Lightning Network'

    const { satoshis } = dto
    let valSats = satoshis
    if (valSats < 0) {
      valSats = 0
    }

    const invoice = await this.murrayRepository.getInvoiceTip({
      num_satoshis: valSats,
      user: interaction.user,
    })

    if (invoice === null) {
      embed.title = 'ERROR'
      embed.description = 'We could not generate an invoice, try again later!'
      return response
    }

    const {
      data: { payment_request },
    } = invoice

    fields.push({
      name: ':moneybag: Amount:',
      value: `${this.numbersService.formatterSATS.format(valSats)} ${valSats < 1 ? 'sat' : 'sats'}`,
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
    const file = new AttachmentBuilder(fileBuff)
    file.setName('qr.png')

    response.files.push(file)

    embed.image = {
      url: 'attachment://qr.png',
    }

    return response
  }
}
