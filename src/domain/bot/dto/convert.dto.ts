import { Choice, Param, ParamType } from '@discord-nestjs/core'

export enum CurrenciesConvert {
  Bitcoin = 'BTC',
  Sats = 'SAT',
  USD = 'USD',
  BRL = 'BRL',
}

export class ConvertDto {
  @Param({
    name: 'value',
    type: ParamType.INTEGER,
    description: 'Value to convert from',
    required: true,
  })
  value: number

  @Choice(CurrenciesConvert)
  @Param({
    name: 'currency',
    description: 'Currency to convert from',
    required: true,
  })
  currency: string
}
