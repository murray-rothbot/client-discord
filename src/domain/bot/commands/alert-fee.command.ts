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
import { MurrayServiceRepository } from '../repositories'
import { createResponse } from 'src/utils/default-response'

@Command({
  name: 'fee-alert',
  description: 'Create an alert fee.',
  defaultMemberPermissions: ['UseApplicationCommands'],
})
@UsePipes(TransformPipe, ValidationPipe)
@Injectable()
export class AlertFeeCommand implements DiscordTransformedCommand<AlertFeeDto> {
  constructor(private readonly repository: MurrayServiceRepository) {}

  async handler(
    @Payload() dto: AlertFeeDto,
    { interaction }: TransformedCommandExecutionContext,
  ): Promise<any> {
    const userId = interaction.user.id
    const { fee } = dto
    const { data: alertInfo } = await this.repository.createFeeAlert({
      userId,
      fee,
    })

    return createResponse(alertInfo)
  }
}
