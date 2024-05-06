import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import axios from "axios";
import { Utils } from "../utils";

const SERVICE_MURRAY_URL = process.env.SERVICE_MURRAY_URL;

export const deployFeesCommand = () => {
  return new SlashCommandBuilder()
    .setName("fees")
    .setDescription("Check recommended fees");
};

export async function feesCommand(
  interaction: CommandInteraction
): Promise<void> {
  try {
    const url = `${SERVICE_MURRAY_URL}/blockchain/fees/recommended`;
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
        name: data.fields.fastestFee.description,
        value: data.fields.fastestFee.value,
        inline: true,
      },
      {
        name: data.fields.halfHourFee.description,
        value: data.fields.halfHourFee.value,
        inline: true,
      },
      {
        name: data.fields.hourFee.description,
        value: data.fields.hourFee.value,
        inline: true,
      },
      {
        name: data.fields.minimum.description,
        value: data.fields.minimum.value,
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
