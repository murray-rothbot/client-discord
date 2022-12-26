import { Command, DiscordCommand } from '@discord-nestjs/core'
import { CommandInteraction } from 'discord.js'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Command({
  name: 'rules',
  description: 'Show list of rules of The Bitcoin Discord Server',
  dmPermission: false,
})
@Injectable()
export class RulesCommand implements DiscordCommand {
  constructor(private readonly cfgService: ConfigService) {}

  handler(interaction: CommandInteraction): any {
    const response = {
      content: '',
      tts: false,
      embeds: [
        {
          type: 'rich',
          title: ':oncoming_police_car: REGRAS DO SERVIDOR',
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

    if (interaction.guildId !== this.cfgService.get<string>('TBD_GUILD_ID')) {
      response.embeds[0].title = 'ERROR'
      response.embeds[0].description =
        'This command is only available in The Bitcoin Discord Server'
      return response
    }

    const rules = [
      `1. Sem referências ou links de afiliados (você será banido).`,
      `2. Se você é iniciante, qualquer dúvida é bem-vinda!`,
      `3. Se você tem alguma experiência seja útil e solícito com os iniciantes.`,
      `4. Não implore ou peça satoshinhos.`,
      `5. O assunto principal do servidor é: Bitcoin. Aqui somos todos bitcoinheiros!`,
      `6. Não falamos sobre shitcoins!`,
      `7. Mas também não fale sobre os seus Bitcoins.`,
      `**8. Cuidado com a sua privacidade, pois este é um servidor aberto.**`,
      `**9. Você é responsável pelo conteúdo de suas mensagens.**`,
      `**10. Não faça SPAM de mensagens.**`,
    ]

    response.embeds[0].description = rules.join('\n')

    return response
  }
}
