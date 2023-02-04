import { IsString } from 'class-validator'

export class MessageResponseDto {
  title: string
  description?: string
  color?: number
  fields: {
    [key: string]: {
      description: string
      value: any
    }
  }
}

export class MessageParamsDto {
  @IsString()
  userId: string
}
