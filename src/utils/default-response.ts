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
