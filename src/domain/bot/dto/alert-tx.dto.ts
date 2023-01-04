import { Param, ParamType } from '@discord-nestjs/core'
import { IsNumber } from 'class-validator'

export class AlertTxDto {
  @Param({
    name: 'transaction',
    description: 'Transaction id (hex)',
    required: true,
  })
  transaction: string

  @Param({
    name: 'confirmations',
    description: 'How many alert confirmations? (default: 1)',
    required: false,
    type: ParamType.INTEGER,
  })
  @IsNumber()
  confirmations: number
}
