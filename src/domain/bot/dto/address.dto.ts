import { Param } from '@discord-nestjs/core'

export class AddressDto {
  @Param({
    name: 'address',
    description: 'An address',
    required: true,
  })
  address: string
}
