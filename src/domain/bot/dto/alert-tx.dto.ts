import { Param, ParamType } from '@discord-nestjs/core'
import { IsNumber, IsOptional, Length, Min } from 'class-validator'

export class AlertTxDto {
  @Param({
    name: 'transaction',
    description: 'Transaction id (hex)',
    required: true,
  })
  @Length(64, 64)
  txId: string

  @Param({
    name: 'confirmations',
    description: 'How many alert confirmations? (default: 1)',
    required: false,
    type: ParamType.INTEGER,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  confirmations: number
}
