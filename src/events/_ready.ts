import { Client } from "discord.js";
import { Utils } from "../utils";

export const ready = async ({ client }: { client: Client }): Promise<void> => {
  try {
    client.once("ready", async () => {
      Utils.logMurray({
        client,
        message: `:satellite: Reconnected`,
      });
    });
  } catch (error) {
    console.error(`events/ready: ${error}`);
  }
};
