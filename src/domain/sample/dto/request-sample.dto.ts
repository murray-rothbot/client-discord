import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator'

export class SampleRequestDto {
  @ApiProperty({
    required: true,
    type: String,
    example: 'BTCUSDT|BTCBRL',
    description: 'Ticker simbol',
    name: 'symbol',
  })
  @IsString()
  @IsNotEmpty()
  symbol: string

  @ApiProperty({
    required: false,
    type: String,
    example: 'user@email.com',
    description: 'user email',
    name: 'email',
  })
  @IsOptional()
  @IsEmail()
  email: string
}
