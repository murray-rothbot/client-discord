import { IsString } from 'class-validator'

export class AlertFeeRequestDto {
  @IsString()
  userId: string
}
