import { Param, ParamType } from '@discord-nestjs/core'
import { IsNotEmpty, IsNumber, Min } from 'class-validator'

export class AlertFeeDto {
  @Param({
    name: 'fee',
    description: 'Fee in sat/vByte',
    required: true,
    type: ParamType.INTEGER,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  fee: number
}
