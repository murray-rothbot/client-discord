import { IsString } from 'class-validator'

export interface AlertFeeBodyDto {
  id: number
  webhookUrl: string
  fee: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export class AlertFeeRequestDto {
  @IsString()
  userId: string
}
