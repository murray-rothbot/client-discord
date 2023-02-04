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
import { createResponse } from 'src/utils/default-response'
import { ok } from 'assert'

@Command({
  name: 'tip',
  description: 'Send a tip to Murray Rothbot! We need your help to keep the lights on!',
})
@UsePipes(TransformPipe, ValidationPipe)
@Injectable()
export class TipCommand implements DiscordTransformedCommand<TipDto> {
  constructor(private readonly murrayRepository: MurrayServiceRepository) {}

  async handler(
    @Payload() dto: TipDto,
    { interaction }: TransformedCommandExecutionContext,
  ): Promise<any> {
    const { satoshis } = dto
    const { user } = interaction

    const invoiceInfo = await this.murrayRepository.getInvoiceTip({
      satoshis,
      user,
    })

    if (invoiceInfo === null) {
      throw [
        {
          property: 'invoice',
          constraints: {
            isValid: 'We could not generate an invoice, try again later!',
          },
        },
      ]
    }

    const { data } = invoiceInfo
    const { paymentRequest } = data.fields

    // return createResponse({ ...data, qrCodeValue: paymentRequest.value })
    interaction.user.send(await createResponse({ ...data, qrCodeValue: paymentRequest.value }))
    return 'Private command: I sent you a direct message.'
  }
}
