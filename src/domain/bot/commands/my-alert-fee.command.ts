import {
  Command,
  DiscordTransformedCommand,
  TransformedCommandExecutionContext,
  Payload,
  UsePipes,
} from '@discord-nestjs/core'
import { TransformPipe } from '@discord-nestjs/common'
import { Injectable } from '@nestjs/common'
import { MyAlertFeeDTO } from '../dto'
import { NumbersService } from 'src/utils/numbers/numbers.service'
import { BlockchainServiceRepository } from '../repositories'

@Command({
  name: 'my-alert-fee',
  description: 'List my fee alerts.',
})
@UsePipes(TransformPipe)
@Injectable()
export class MyAlertFeeCommand implements DiscordTransformedCommand<MyAlertFeeDTO> {
  constructor(
    private readonly blockchainRepository: BlockchainServiceRepository,
    private readonly numbersService: NumbersService,
  ) {}

  async handler(
    @Payload() dto: MyAlertFeeDTO,
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
            name: `🗓️ Schedule Alert Fee 🔔`,
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

    const userId = interaction.user.id
    const { data: alerts } = await this.blockchainRepository.listAlertFee({ userId })

    const fields = response.embeds[0].fields

    if (alerts.length == 0) {
      fields.push({
        name: 'No fee alerts scheduled.',
        value: 'Use `\/alert-fee` to schedule one.',
      })
    } else if (alerts.length > 1) {
      fields.push({
        name: 'You will receive an alert when the fee reaches',
        value: '\u200B',
      })
    }

    for (const data of alerts) {
      const currentPrice =
        data.currency === 'USD'
          ? this.numbersService.formatterUSD.format(data.currentPrice)
          : this.numbersService.formatterBRL.format(data.currentPrice)
      const side = data.above ? '🔼 Higher or equal then' : '🔽 Lower or equal then'
      const flag = data.currency === 'USD' ? '🇺🇸' : '🇧🇷'
      const priceAlert =
        data.currency === 'USD'
          ? this.numbersService.formatterUSD.format(data.price)
          : this.numbersService.formatterBRL.format(data.price)

      if (alerts.length == 1) {
        fields.push({
          name: 'You will receive an alert when the fee reaches',
          value: `**\nLower or equal then:\n🔽 ${data.fee} sats/vbyte\n**`,
        })
      } else {
        fields.push({
          name: `Lower or equal then:`,
          value: `🔽 ${data.fee} sats/vbyte`,
          inline: true,
        })
      }
    }

    if (alerts.length > 3 && alerts.length % 3 != 0) {
      for (let i = 0; i < 3 - (alerts.length % 3); i++) {
        fields.push({ name: `\u200B`, value: `\u200B`, inline: true })
      }
    }

    return response
  }
}
