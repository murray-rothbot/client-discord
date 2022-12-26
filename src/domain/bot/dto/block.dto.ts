import { Param } from '@discord-nestjs/core'
// import { Transform } from 'class-transformer'
// import { Transform } from 'class-transformer'

export class BlockDto {
  // @Transform(({ value }) => value.toUpperCase())
  @Param({
    name: 'id',
    description: 'Block hash or block height.',
    required: false,
  })
  id: string
}
