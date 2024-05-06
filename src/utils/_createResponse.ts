import { EmbedBuilder } from "discord.js";

export interface ICreateResponseProps {
  message: {
    title?: string | null;
    description?: string | null;
    color?: number | null;
  };
  fields?: any;
  qrcode?: boolean;
}

export const createResponse = ({
  message: { title = null, description = null, color = 0xff9900 },
  fields = [],
  qrcode = false,
}: ICreateResponseProps): EmbedBuilder => {
  return new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(description ? description : null)
    .addFields(fields)
    .setImage(qrcode ? "attachment://qr.png" : null)
    .setTimestamp()
    .setFooter({
      text: "Powered by Murray Rothbot",
      iconURL: "https://avatars.githubusercontent.com/u/119825865?s=200&v=4",
    });
};
