import { Param } from '@discord-nestjs/core'

export class NodeDto {
  @Param({
    name: 'pubkey',
    description: 'Node public key or alias',
    required: true,
  })
  pubkey: string
}
