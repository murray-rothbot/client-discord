import { AttachmentBuilder } from 'discord.js'
import * as QRCode from 'qrcode'

interface DefaultResponseI {
  title?: string
  description?: string
  color?: number
  fields?: object
  qrCodeValue?: string
}

export function defaultResponse() {
  return {
    content: '',
    tts: false,
    files: [],
    embeds: [
      {
        title: '',
        description: '',
        color: 0xff9900,
        timestamp: new Date().toISOString(),
        fields: [],
        image: null,
        thumbnail: null,
        author: {
          name: ``,
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
}

function addField(fieldsArr: any[], { description, value, inline = false }: any) {
  if (typeof value === 'string') {
    fieldsArr.push({
      name: description,
      value,
      inline,
    })
  } else {
    if (value?.url) {
      addField(fieldsArr, {
        description,
        value: `[${value.id.value}](${value.url.value})`,
        inline,
      })
    } else {
      fieldsArr.push({
        name: '\u200B',
        value: description,
        inline,
      })

      Object.keys(value).forEach((key) => addField(fieldsArr, value[key]))
    }
  }
}

export async function createResponse({
  title = '',
  description = '',
  fields = [],
  color = 0xff9900,
  qrCodeValue = null,
}: DefaultResponseI) {
  const fieldsArr = []
  const files = []

  Object.keys(fields).forEach((key) => addField(fieldsArr, fields[key]))

  if (qrCodeValue) {
    const fileBuff = await QRCode.toDataURL(qrCodeValue)
      .then((url: string) => {
        return Buffer.from(url.split(',')[1], 'base64')
      })
      .catch((err: any) => {
        console.error(err)
      })
    const file = new AttachmentBuilder(fileBuff)
    file.setName('qr.png')
    files.push(file)
  }

  return {
    content: '',
    tts: false,
    files,
    embeds: [
      {
        title,
        description,
        color,
        timestamp: new Date().toISOString(),
        fields: fieldsArr,
        image: files ? { url: 'attachment://qr.png' } : null,
        thumbnail: null,
        author: {
          name: ``,
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
}
