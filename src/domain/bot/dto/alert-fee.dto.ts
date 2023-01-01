import { Param, ParamType } from '@discord-nestjs/core'
import { IsNotEmpty, IsNumber } from 'class-validator'

export class AlertFeeDto {
  @Param({
    name: 'fee',
    description: 'Fee in sat/vbyte',
    required: true,
    type: ParamType.INTEGER,
  })
  @IsNotEmpty()
  @IsNumber()
  fee: number
}
