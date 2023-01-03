import { IsString } from 'class-validator'

export interface AlertTxBodyDto {
  id: number
  webhookUrl: string
  txId: string
  confirmationsAlert: number
  active: boolean
  createdAt: string
  updatedAt: string
  currentConfirmation: number
  currentBlock: number
}

export class AlertTxRequestDto {
  @IsString()
  userId: string
}
