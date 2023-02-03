import { IsString } from 'class-validator'

export class AlertTxRequestDto {
  @IsString()
  userId: string
}
