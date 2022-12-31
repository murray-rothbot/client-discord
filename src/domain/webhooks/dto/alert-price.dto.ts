import { IsString } from 'class-validator'

export interface AlertPriceBodyDto {
  id: number
  webhookUrl: string
  currency: string
  currentPrice: number
  price: number
  above: boolean
  active: boolean
  createdAt: string
  updatedAt: string
}

export class AlertPriceRequestDto {
  @IsString()
  userId: string
}
