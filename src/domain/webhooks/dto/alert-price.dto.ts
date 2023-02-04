import { IsString } from 'class-validator'

export class AlertPriceRequestDto {
  @IsString()
  userId: string
}
