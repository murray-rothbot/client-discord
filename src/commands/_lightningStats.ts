import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import axios from "axios";
import { Utils } from "../utils";

const SERVICE_MURRAY_URL = process.env.SERVICE_MURRAY_URL;

export const deployLightningStatsCommand = () => {
  return new SlashCommandBuilder()
    .setName("lightning-stats")
    .setDescription("Statistics about the Lightning Network");
};

export async function lightningStatsCommand(
  interaction: CommandInteraction
): Promise<void> {
  try {
    const url = `${SERVICE_MURRAY_URL}/lightning/statistics`;
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
        name: data.fields.nodes.description,
        value: data.fields.nodes.value,
        inline: true,
      },
      {
        name: data.fields.channels.description,
        value: data.fields.channels.value,
        inline: true,
      },
      { name: "\u200B", value: "\u200B", inline: true },
      {
        name: data.fields.clearNet.description,
        value: data.fields.clearNet.value,
        inline: true,
      },
      {
        name: data.fields.tor.description,
        value: data.fields.tor.value,
        inline: true,
      },
      { name: "\u200B", value: "\u200B", inline: true },
      {
        name: data.fields.avgCapacity.description,
        value: data.fields.avgCapacity.value,
        inline: true,
      },
      {
        name: data.fields.totalCapacity.description,
        value: data.fields.totalCapacity.value,
        inline: true,
      },
      { name: "\u200B", value: "\u200B", inline: true },
      {
        name: data.fields.avgFee.description,
        value: data.fields.avgFee.value,
        inline: true,
      },
      {
        name: data.fields.avgBaseFee.description,
        value: data.fields.avgBaseFee.value,
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
