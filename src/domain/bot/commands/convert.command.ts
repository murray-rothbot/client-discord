import { TransformPipe, ValidationPipe } from '@discord-nestjs/common'
import {
  Command,
  DiscordTransformedCommand,
  Payload,
  TransformedCommandExecutionContext,
  UsePipes,
} from '@discord-nestjs/core'
import { Injectable } from '@nestjs/common'
import { NumbersService } from 'src/utils/numbers/numbers.service'
import { PricesServiceRepository } from '../repositories'
import { ConvertDto } from '../dto'
import { defaultResponse } from 'src/utils/default-response'

@Command({
  name: 'convert',
  description: 'Convert bitcoin <-> fiat',
})
@UsePipes(TransformPipe, ValidationPipe)
@Injectable()
export class ConvertCommand implements DiscordTransformedCommand<ConvertDto> {
  constructor(
    private readonly priceRepository: PricesServiceRepository,
    private readonly numbersService: NumbersService,
  ) {}

  async handler(
    @Payload() dto: ConvertDto,
    { interaction }: TransformedCommandExecutionContext,
  ): Promise<any> {
    const response = defaultResponse()
    const embed = response.embeds[0]
    const fields = embed.fields

    embed.title = '↔️ Conversion'

    const { value, currency } = dto
    const request = { value: Math.abs(value), currency }
    const {
      data: { btc, sat, usd, brl },
    } = await this.priceRepository.convert(request)

    fields.push({
      name: '🟠 Bitcoin',
      value: `${this.numbersService.formatterBTC.format(btc)} BTC`,
      inline: false,
    })

    fields.push({
      name: '⚡ Satoshis',
      value: `${this.numbersService.formatterSATS.format(sat)} sats`,
      inline: false,
    })

    fields.push({
      name: '🇺🇸 Dollars',
      value: `${this.numbersService.formatterUSD.format(usd)}`,
      inline: false,
    })

    fields.push({
      name: '🇧🇷 Reais',
      value: `${this.numbersService.formatterBRL.format(brl)}`,
      inline: false,
    })

    return response
  }
}
