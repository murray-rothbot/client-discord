import { Client } from "discord.js";
import { commands } from "../commands";
import { Utils } from "../utils";

export const interactionCreate = async ({
  client,
}: {
  client: Client;
}): Promise<void> => {
  try {
    client.on("interactionCreate", async (interaction) => {
      try {
        if (!interaction.isCommand()) return;

        const { commandName } = interaction;
        const commandHandler = commands.commands[commandName];

        Utils.logMurray({
          client,
          message: `:robot: \`/${commandName}\` command executed by <@${interaction.user.id}>`,
        });

        if (commandHandler) {
          await commandHandler(interaction);
        }
      } catch (error) {
        console.error(`events/interactionCreate/response: ${error}`);
      }
    });
  } catch (error) {
    console.error(`events/interactionCreate: ${error}`);
  }
};
