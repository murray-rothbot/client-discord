import { Param } from '@discord-nestjs/core'
import { Length } from 'class-validator'

export class AddressDto {
  @Param({
    name: 'address',
    description: 'An address',
    required: true,
  })
  @Length(20, 90)
  address: string
}
