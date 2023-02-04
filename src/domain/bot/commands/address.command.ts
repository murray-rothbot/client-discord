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

    return createResponse(addressInfo.data, (key, inline) => ['received', 'sent'].includes(key))
  }
}
