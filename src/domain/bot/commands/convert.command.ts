import { TransformPipe, ValidationPipe } from '@discord-nestjs/common'
import {
  Command,
  DiscordTransformedCommand,
  Payload,
  TransformedCommandExecutionContext,
  UsePipes,
} from '@discord-nestjs/core'
import { Injectable } from '@nestjs/common'
import { MurrayServiceRepository } from '../repositories'
import { ConvertDto } from '../dto'
import { createResponse } from 'src/utils/default-response'

@Command({
  name: 'convert',
  description: 'Convert bitcoin <-> fiat',
  defaultMemberPermissions: ['UseApplicationCommands'],
})
@UsePipes(TransformPipe, ValidationPipe)
@Injectable()
export class ConvertCommand implements DiscordTransformedCommand<ConvertDto> {
  constructor(private readonly murrayRepository: MurrayServiceRepository) {}

  async handler(
    @Payload() dto: ConvertDto,
    { interaction }: TransformedCommandExecutionContext,
  ): Promise<any> {
    const { value, currency } = dto
    const payload = { value: Math.abs(value), currency }

    const convertInfo = await this.murrayRepository.convert(payload)
    return createResponse(convertInfo.data)
  }
}
