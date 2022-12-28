import { Param } from '@discord-nestjs/core'

export class TransactionDto {
  @Param({
    name: 'transaction',
    description: 'A transaction id',
    required: true,
  })
  transaction: string
}
