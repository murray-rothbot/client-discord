import { TransformPipe } from '@discord-nestjs/common'
import {
  Command,
  DiscordTransformedCommand,
  Payload,
  TransformedCommandExecutionContext,
  UsePipes,
} from '@discord-nestjs/core'
import { Injectable } from '@nestjs/common'
import { BlockchainServiceRepository } from '../repositories'
import { AlertTxDto } from '../dto/alert-tx.dto'

@Command({
  name: 'alert-tx',
  description: 'Create new transaction alert',
})
@UsePipes(TransformPipe)
@Injectable()
export class AlertTxCommand implements DiscordTransformedCommand<AlertTxDto> {
  constructor(private readonly blockchainRepository: BlockchainServiceRepository) {}

  async handler(
    @Payload() dto: AlertTxDto,
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

    const fields = response.embeds[0].fields

    try {
      const { transaction, confirmations } = dto
      if (!confirmations) {
        dto.confirmations = 1
      }

      const userId = interaction.user.id
      await this.blockchainRepository.createAlertTx({
        userId,
        txId: transaction,
        confirmationsAlert: dto.confirmations,
      })

      fields.push({
        name: 'Transaction Hex:',
        value: `🔀 ${transaction}`,
      })
      fields.push({
        name: `✅ How many confirmations?`,
        value: `${dto.confirmations}`,
        inline: true,
      })
    } catch (err) {
      console.error(err)

      response.embeds[0].title = 'ERROR'
      response.embeds[0].description = 'Something went wrong'
    }

    return response
  }
}
