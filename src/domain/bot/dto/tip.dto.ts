import { Param, ParamType } from '@discord-nestjs/core'

export class TipDto {
  @Param({
    name: 'satoshis',
    description: 'Amount of satoshis to tip',
    required: true,
    type: ParamType.INTEGER,
  })
  satoshis: number
}
