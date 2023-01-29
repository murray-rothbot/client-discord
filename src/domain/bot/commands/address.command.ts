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
import { AddressDto } from '../dto'
import { createResponse } from 'src/utils/default-response'

@Command({
  name: 'address',
  description: 'Information about an address',
})
@UsePipes(TransformPipe, ValidationPipe)
@Injectable()
export class AddressCommand implements DiscordTransformedCommand<AddressDto> {
  constructor(private readonly murrayRepository: MurrayServiceRepository) {}

  async handler(
    @Payload() dto: AddressDto,
    { interaction }: TransformedCommandExecutionContext,
  ): Promise<any> {
    const { address } = dto
    const addressInfo = await this.murrayRepository.getAddress({ address })

    if (!addressInfo) {
      throw [
        {
          property: 'address',
          constraints: {
            isValid: 'address must be valid',
          },
        },
      ]
    }

    addressInfo.data.fields.onchain.value.received.inline = true
    addressInfo.data.fields.onchain.value.sent.inline = true
    addressInfo.data.fields.mempool.value.received.inline = true
    addressInfo.data.fields.mempool.value.sent.inline = true

    return createResponse(addressInfo.data)
  }
}
