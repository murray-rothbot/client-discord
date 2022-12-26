export class ICommandResponse {
  content: string
  tts: boolean
  embeds: {
    type: string
    title: string
    description: string
    color: number
    timestamp: Date
    fields: any[]
    footer?: {
      text: string
      icon_url: string
    }
    author?: {
      name: string
      url: string
      icon_url: string
    }
  }[]
}
