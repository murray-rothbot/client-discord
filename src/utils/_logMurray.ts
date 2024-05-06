import { Client, TextChannel } from "discord.js";

const LOG_CHANNEL_ID = `${process.env.LOG_CHANNEL_ID}`;

interface ILogMurrayProps {
  client: Client;
  message: string;
}

export const logMurray = async ({
  client,
  message,
}: ILogMurrayProps): Promise<void> => {
  try {
    const channel = await client.channels.fetch(LOG_CHANNEL_ID);
    (<TextChannel>channel).send(message);
  } catch (error) {
    console.error(`logMurray: ${error}`);
  }
};
