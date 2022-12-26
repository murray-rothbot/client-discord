import { Param } from '@discord-nestjs/core'

export class BlockDto {
  @Param({
    name: 'id',
    description: 'Block hash or block height.',
    required: false,
  })
  id: string
}
