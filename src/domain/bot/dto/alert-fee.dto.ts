import { Param, ParamType } from '@discord-nestjs/core'
import { IsNotEmpty, IsNumber } from 'class-validator'

export class AlertFeeDto {
  @Param({
    name: 'fee',
    description: 'Fee in sat/vByte',
    required: true,
    type: ParamType.INTEGER,
  })
  @IsNotEmpty()
  @IsNumber()
  fee: number
}
