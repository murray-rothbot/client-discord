import { Param } from '@discord-nestjs/core'
import { IsOptional, Length } from 'class-validator'

export class BlockDto {
  @Param({
    name: 'id',
    description: 'Block hash or block height.',
    required: false,
  })
  @IsOptional()
  @Length(64, 64)
  id: string
}
