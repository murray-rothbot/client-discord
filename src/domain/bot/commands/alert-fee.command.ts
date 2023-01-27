import {
  Command,
  DiscordTransformedCommand,
  TransformedCommandExecutionContext,
  Payload,
  UsePipes,
} from '@discord-nestjs/core'
import { TransformPipe, ValidationPipe } from '@discord-nestjs/common'
import { Injectable } from '@nestjs/common'
import { AlertFeeDto } from '../dto/alert-fee.dto'
import { BlockchainServiceRepository } from '../repositories/blockchainservice.repository'
import { defaultResponse } from 'src/utils/default-response'

@Command({
  name: 'alert-fee',
  description: 'Create an alert fee.',
})
@UsePipes(TransformPipe, ValidationPipe)
@Injectable()
export class AlertFeeCommand implements DiscordTransformedCommand<AlertFeeDto> {
  constructor(private readonly blockchainRepository: BlockchainServiceRepository) {}

  async handler(
    @Payload() dto: AlertFeeDto,
    { interaction }: TransformedCommandExecutionContext,
  ): Promise<any> {
    const response = defaultResponse()
    const embed = response.embeds[0]
    const fields = embed.fields
    embed.title = '🗓️ Schedule Alert Fee'

    const { fee } = dto
    const userId = interaction.user.id
    const { data } = await this.blockchainRepository.createAlertFee({
      userId,
      fee,
    })

    fields.push({
      name: 'You will receive an alert when the fee reaches',
      value: `\u200b`,
    })

    fields.push({
      name: 'Lower or equal then:',
      value: `⬇️ ${data.fee} sats/vByte\n`,
    })

    return response
  }
}
