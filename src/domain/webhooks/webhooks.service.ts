import { InjectDiscordClient } from '@discord-nestjs/core'
import { Injectable } from '@nestjs/common'
import { Client, EmbedBuilder } from 'discord.js'
import { NumbersService } from 'src/utils/numbers/numbers.service'
import { IAlertPrice } from './interfaces'

@Injectable()
export class WebhooksService {
  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
    private readonly numbersService: NumbersService,
  ) {}

  sendAlertPrices(alertPrices: IAlertPrice[]) {
    alertPrices.forEach((alertPrice) => {
      this.client.users.fetch(alertPrice.userId).then((user) => {
        const { price, currency, above } = alertPrice

        const currentPrice =
          currency === 'USD'
            ? this.numbersService.formatterUSD.format(alertPrice.currentPrice)
            : this.numbersService.formatterBRL.format(alertPrice.currentPrice)
        const side = above ? 'Higher or equal then:\n🔼 ' : 'Lower or equal  then\n🔽 '
        const flag = currency === 'USD' ? '🇺🇸' : '🇧🇷'
        const priceAlert =
          currency === 'USD'
            ? this.numbersService.formatterUSD.format(price)
            : this.numbersService.formatterBRL.format(price)

        const fields = []
        fields.push({
          name: 'Your alert price was reached!',
          value: `**\n${side}${flag} ${priceAlert}\n\nCurrent Price:\n${flag} ${currentPrice}**`,
        })

        const embed = new EmbedBuilder()
          .setAuthor({
            name: `🔔 New Alert Price 🔔`,
            url: `https://murrayrothbot.com/`,
            iconURL: `https://murrayrothbot.com/murray-rothbot2.png`,
          })
          .setFields(fields)
          .setFooter({
            text: `Powered by Murray Rothbot`,
            iconURL: `https://murrayrothbot.com/murray-rothbot2.png`,
          })
          .setTimestamp(new Date())
          .setColor(0xff9900)

        user.send({
          embeds: [embed],
        })
      })
    })

    return true
  }
}
