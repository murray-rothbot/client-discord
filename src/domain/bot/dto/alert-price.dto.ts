import { Param, Choice, ParamType } from '@discord-nestjs/core'
import { IsNotEmpty, IsString, IsEnum, IsNumber } from 'class-validator'

export enum Currencies {
  USD = 'USD',
  BRL = 'BRL',
}
export class AlertPriceDto {
  @Param({
    name: 'price',
    description: 'Price to alert',
    required: true,
    type: ParamType.INTEGER,
  })
  @IsNotEmpty()
  @IsNumber()
  price: number

  @Choice(Currencies)
  @Param({
    name: 'currency',
    description: 'Currency (BRL or USD)',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum(['BRL', 'USD'])
  currency: string
}