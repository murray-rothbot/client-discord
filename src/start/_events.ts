import { Client } from "discord.js";
import { Events as E } from "../events";

export const Events = async ({ client }: { client: Client }): Promise<void> => {
  Object.keys(E).forEach((key) => {
    (
      E as {
        [key: string]: Function;
      }
    )[key]({
      client,
    });
  });
};
