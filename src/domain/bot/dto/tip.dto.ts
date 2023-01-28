import { Param, ParamType } from '@discord-nestjs/core'
import { Min } from 'class-validator'

export class TipDto {
  @Param({
    name: 'satoshis',
    description: 'Amount of satoshis to tip',
    required: true,
    type: ParamType.INTEGER,
  })
  @Min(1)
  satoshis: number
}
