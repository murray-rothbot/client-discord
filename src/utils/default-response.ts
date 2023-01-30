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

function addField(fieldsArr: any[], key, { description, value, inline }: any, inlineFunc) {
  if (typeof value === 'object') {
    if (value?.url) {
      // It's a URL composed field
      addField(
        fieldsArr,
        key,
        {
          description,
          value: `[${value.id.value}](${value.url.value})`,
          inline,
        },
        inlineFunc,
      )
    } else {
      // Add group title
      addField(fieldsArr, key, { name: '', value: description, inline }, inlineFunc)
      Object.keys(value).forEach((sub_key) =>
        addField(fieldsArr, sub_key, value[sub_key], inlineFunc),
      )
    }
  } else if (description || value) {
    // Simple field
    fieldsArr.push({
      name: description || '\u200B',
      value: value || '\u200B',
      inline: inlineFunc(key, inline),
    })
  }
}

export async function createResponse(
  {
    title = '',
    description = '',
    fields = [],
    color = 0xff9900,
    qrCodeValue = null,
  }: DefaultResponseI,
  inlineFunc = (key, value) => value,
) {
  const fieldsArr = []
  const files = []

  Object.keys(fields).forEach((key) => addField(fieldsArr, key, fields[key], inlineFunc))

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

  // Allow this till we finnish the refactoring, please
  // console.log(JSON.stringify(fields, null, 2))

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
