import {
  Command,
  DiscordTransformedCommand,
  TransformedCommandExecutionContext,
  Payload,
  UsePipes,
} from '@discord-nestjs/core'
import { TransformPipe } from '@discord-nestjs/common'
import { Injectable } from '@nestjs/common'
import { MyAlertTxDTO } from '../dto'
import { NumbersService } from 'src/utils/numbers/numbers.service'
import { BlockchainServiceRepository } from '../repositories'

@Command({
  name: 'my-alert-tx',
  description: 'List my transaction alerts.',
})
@UsePipes(TransformPipe)
@Injectable()
export class MyAlertTxCommand implements DiscordTransformedCommand<MyAlertTxDTO> {
  constructor(
    private readonly blockchainServiceRepository: BlockchainServiceRepository,
    private readonly numbersService: NumbersService,
  ) {}

  async handler(
    @Payload() dto: MyAlertTxDTO,
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
            name: `🗓️ Schedule Alert Transaction 🔔`,
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
    const { data: alerts } = await this.blockchainServiceRepository.listAlertTx({ userId })

    const fields = response.embeds[0].fields

    if (alerts.length == 0) {
      fields.push({
        name: 'No transaction alerts scheduled.',
        value: 'Use `\\alert-tx` to schedule one.',
      })
    }

    for (const { txId, confirmationsAlert } of alerts) {
      if (alerts.length == 1) {
        fields.push({
          name: 'Transaction Hex:',
          value: `🔀 ${txId}`,
        })

        fields.push({
          name: `✅ Waiting for how many confirmations?`,
          value: `${confirmationsAlert}`,
          inline: true,
        })
      } else {
        fields.push({
          name: `${txId}`,
          value: `✅ Waiting for how many confirmations? ${confirmationsAlert}`,
          inline: false,
        })
      }
    }

    return response
  }
}
