import { TransformPipe, ValidationPipe } from '@discord-nestjs/common'
import {
  Command,
  DiscordTransformedCommand,
  Payload,
  TransformedCommandExecutionContext,
  UsePipes,
} from '@discord-nestjs/core'
import { Injectable } from '@nestjs/common'
import { BlockchainServiceRepository } from '../repositories'
import { AddressDto } from '../dto'
import { NumbersService } from 'src/utils/numbers/numbers.service'
import { defaultResponse } from 'src/utils/default-response'

@Command({
  name: 'address',
  description: 'Information about an address',
})
@UsePipes(TransformPipe, ValidationPipe)
@Injectable()
export class AddressCommand implements DiscordTransformedCommand<AddressDto> {
  constructor(
    private readonly blockRepository: BlockchainServiceRepository,
    private readonly numbersService: NumbersService,
  ) {}

  async handler(
    @Payload() dto: AddressDto,
    { interaction }: TransformedCommandExecutionContext,
  ): Promise<any> {
    const response = defaultResponse()
    const embed = response.embeds[0]
    const fields = embed.fields

    const { address } = dto
    const { data } = await this.blockRepository.getAddress({ address })

    if (!data) {
      throw [
        {
          property: 'address',
          constraints: {
            isValid: 'address must be valid',
          },
        },
      ]
    }

    fields.push({
      name: '🪧 Address',
      value: `[${address}](https://mempool.space/address/${address})`,
    })

    var {
      chain_stats: { funded_txo_count, funded_txo_sum, spent_txo_count, spent_txo_sum },
    } = data

    fields.push({ name: '\u200B', value: 'On chain transactions:' })
    fields.push({
      name: `📥 Received: ${funded_txo_count}`,
      value: `Total: ${this.numbersService.formatterSATS.format(funded_txo_sum)} sats`,
      inline: true,
    })
    fields.push({
      name: `📤 Sent: ${spent_txo_count}`,
      value: `Total: ${this.numbersService.formatterSATS.format(spent_txo_sum)} sats`,
      inline: true,
    })

    var {
      mempool_stats: { funded_txo_count, funded_txo_sum, spent_txo_count, spent_txo_sum },
    } = data

    fields.push({ name: '\u200B', value: 'Mempool transactions:' })
    fields.push({
      name: `📥 Received: ${funded_txo_count}`,
      value: `Total: ${this.numbersService.formatterSATS.format(funded_txo_sum)} sats`,
      inline: true,
    })
    fields.push({
      name: `📤 Sent: ${spent_txo_count}`,
      value: `Total: ${this.numbersService.formatterSATS.format(spent_txo_sum)} sats`,
      inline: true,
    })

    return response
  }
}
