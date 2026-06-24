import { Client } from "discord.js";
import { commands } from "../commands";
import { Utils } from "../utils";
import { formatDiscordCommandLog } from "../utils/_formatDiscordMemberLog";

export const interactionCreate = async ({
  client,
}: {
  client: Client;
}): Promise<void> => {
  try {
    client.on("interactionCreate", async (interaction) => {
      try {
        if (!interaction.isChatInputCommand()) return;

        const { commandName } = interaction;
        const commandHandler = commands.commands[commandName];
        const member =
          interaction.member && "displayName" in interaction.member
            ? interaction.member
            : { id: interaction.user.id, user: interaction.user };

        Utils.logMurray({
          client,
          message: formatDiscordCommandLog(commandName, member),
        });

        if (commandHandler) {
          await commandHandler(interaction);
        }
      } catch (error) {
        console.log(`events/interactionCreate/response: ${error}`);
      }
    });
  } catch (error) {
    console.log(`events/interactionCreate: ${error}`);
  }
};
