import { Param } from '@discord-nestjs/core'
import { Length } from 'class-validator'

export class TransactionDto {
  @Param({
    name: 'transaction',
    description: 'A transaction id',
    required: true,
  })
  @Length(64, 64)
  transaction: string
}
