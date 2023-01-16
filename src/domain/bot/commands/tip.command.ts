import { TransformPipe } from '@discord-nestjs/common'
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

@Command({
  name: 'tip',
  description: 'Send a tip to Murray Rothbot! We need your help to keep the lights on!',
})
@UsePipes(TransformPipe)
@Injectable()
export class TipCommand implements DiscordTransformedCommand<TipDto> {
  constructor(private readonly murrayRepository: MurrayServiceRepository) {}

  async handler(
    @Payload() dto: TipDto,
    { interaction }: TransformedCommandExecutionContext,
  ): Promise<any> {
    const response = {
      content: '',
      tts: false,
      embeds: [
        {
          type: 'rich',
          title: 'Tip Murray Rothbot with Lightning Network',
          description: 'We need your help to keep the lights on!',
          color: 0xff9900,
          timestamp: new Date(),
          fields: [],
          footer: {
            text: `Powered by Murray Rothbot`,
            icon_url: `https://murrayrothbot.com/murray-rothbot2.png`,
          },
        },
      ],
      files: [],
    }

    const fields = response.embeds[0].fields

    try {
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
        response.embeds[0].title = 'ERROR'
        response.embeds[0].description = 'We could not generate an invoice, try again later!'
        return response
      }

      const {
        data: { payment_request },
      } = invoice

      fields.push({
        name: ':moneybag: Amount (sats):',
        value: `${valSats} ${valSats < 1 ? 'sat' : 'sats'}`,
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
    } catch (err) {
      console.error(err)

      response.embeds[0].title = 'ERROR'
      response.embeds[0].description = 'Something went wrong'
    }
    return response
  }
}
