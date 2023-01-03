import { TransformPipe } from '@discord-nestjs/common'
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

@Command({
  name: 'convert',
  description: 'Convert bitcoin <-> fiat',
})
@UsePipes(TransformPipe)
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
          footer: {
            text: `Powered by Murray Rothbot`,
            icon_url: `https://murrayrothbot.com/murray-rothbot2.png`,
          },
        },
      ],
    }

    const fields = response.embeds[0].fields

    try {
      const { value, currency } = dto
      const request = { value: Math.abs(value), currency }
      const {
        data: { btc, sat, usd, brl },
      } = await this.priceRepository.convert(request)

      fields.push({
        name: 'Bitcoin',
        value: `${this.numbersService.formatterBTC.format(btc)} BTC`,
        inline: false,
      })

      fields.push({
        name: 'Satoshis',
        value: `${this.numbersService.formatterSATS.format(sat)} sats`,
        inline: false,
      })

      fields.push({
        name: 'Dollars',
        value: `${this.numbersService.formatterUSD.format(usd)}`,
        inline: false,
      })

      fields.push({
        name: 'Reais',
        value: `${this.numbersService.formatterBRL.format(brl)}`,
        inline: false,
      })
    } catch (err) {
      console.log(err)
      response.embeds[0].title = 'ERROR'
      response.embeds[0].description = 'Something went wrong'
    }

    return response
  }
}
