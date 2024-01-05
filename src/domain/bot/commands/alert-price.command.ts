import {
  Command,
  DiscordTransformedCommand,
  TransformedCommandExecutionContext,
  Payload,
  UsePipes,
} from '@discord-nestjs/core'
import { TransformPipe, ValidationPipe } from '@discord-nestjs/common'
import { Injectable } from '@nestjs/common'
import { AlertPriceDto } from '../dto/alert-price.dto'
import { MurrayServiceRepository } from '../repositories'
import { createResponse } from 'src/utils/default-response'

@Command({
  name: 'price-alert',
  description: 'Create an alert price.',
  defaultMemberPermissions: ['UseApplicationCommands'],
})
@UsePipes(TransformPipe, ValidationPipe)
@Injectable()
export class AlertPriceCommand implements DiscordTransformedCommand<AlertPriceDto> {
  constructor(private readonly repository: MurrayServiceRepository) {}

  async handler(
    @Payload() dto: AlertPriceDto,
    { interaction }: TransformedCommandExecutionContext,
  ): Promise<any> {
    const userId = interaction.user.id
    const { price, currency } = dto
    const { data: alertInfo } = await this.repository.createPriceAlert({
      userId,
      price,
      currency,
    })

    return createResponse(alertInfo)
  }
}
