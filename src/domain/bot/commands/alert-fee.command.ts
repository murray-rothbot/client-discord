import {
  Command,
  DiscordTransformedCommand,
  TransformedCommandExecutionContext,
  Payload,
  UsePipes,
} from '@discord-nestjs/core'
import { TransformPipe } from '@discord-nestjs/common'
import { Injectable } from '@nestjs/common'
import { AlertFeeDto } from '../dto/alert-fee.dto'
import { NumbersService } from 'src/utils/numbers/numbers.service'
import { BlockchainServiceRepository } from '../repositories/blockchainservice.repository'

@Command({
  name: 'alert-fee',
  description: 'Create an alert fee.',
})
@UsePipes(TransformPipe)
@Injectable()
export class AlertFeeCommand implements DiscordTransformedCommand<AlertFeeDto> {
  constructor(
    private readonly blockchainRepository: BlockchainServiceRepository,
    private readonly numbersService: NumbersService,
  ) {}

  async handler(
    @Payload() dto: AlertFeeDto,
    { interaction }: TransformedCommandExecutionContext,
  ): Promise<any> {
    const response = {
      content: '',
      tts: false,
      embeds: [
        {
          type: 'rich',
          title: '',
          description: '',
          color: 0xff9900,
          timestamp: new Date(),
          fields: [],
          author: {
            name: `🗓️ Schedule Alert Price 🔔`,
            url: `https://murrayrothbot.com/`,
            icon_url: `https://murrayrothbot.com/murray-rothbot2.png`,
          },
          footer: {
            text: `Powered by Murray Rothbot`,
            icon_url: `https://murrayrothbot.com/murray-rothbot2.png`,
          },
        },
      ],
    }

    const { fee } = dto

    const userId = interaction.user.id
    const { data } = await this.blockchainRepository.createAlertFee({
      userId,
      fee,
    })

    const fields = response.embeds[0].fields
    fields.push({
      name: 'You will receive an alert when the fee reaches',
      value: `**\nLower or equal then:\n🔽 ${data.fee} sats/vbyte\n**`,
    })
    return response
  }
}
