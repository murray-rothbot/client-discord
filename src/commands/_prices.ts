import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import axios from "axios";
import { Utils } from "../utils";

const SERVICE_MURRAY_URL = process.env.SERVICE_MURRAY_URL;

export const deployPricesCommand = () => {
  return new SlashCommandBuilder()
    .setName("prices")
    .setDescription("Check prices");
};

export async function pricesCommand(
  interaction: CommandInteraction
): Promise<void> {
  try {
    const url = `${SERVICE_MURRAY_URL}/prices`;
    const result = await axios.get(url);
    const { data } = result.data;

    if (data.fields.error) {
      const embedMsg = Utils.createResponse({
        message: data,
      });

      interaction.reply({
        embeds: [embedMsg],
        ephemeral: true,
      });

      return;
    }

    const fields = [
      {
        name: data.fields.USD.description,
        value: data.fields.USD.value,
        inline: true,
      },
      {
        name: data.fields.BRL.description,
        value: data.fields.BRL.value,
        inline: true,
      },
    ];

    const embedMsg = Utils.createResponse({
      message: data,
      fields,
    });

    interaction.reply({ embeds: [embedMsg], ephemeral: true });
  } catch (error) {
    console.log(error);
  }
}
