import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import axios from "axios";
import { Utils } from "../utils";

const SERVICE_MURRAY_URL = process.env.SERVICE_MURRAY_URL;

export const deployLightningTopCommand = () => {
  return new SlashCommandBuilder()
    .setName("lightning-top")
    .setDescription("Top Lightning Nodes");
};

export async function lightningTopCommand(
  interaction: CommandInteraction
): Promise<void> {
  try {
    const url = `${SERVICE_MURRAY_URL}/lightning/top`;
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

    const topByCapacity = data.fields.topByCapacity.value;
    const topByChannels = data.fields.topByChannels.value;

    const fields = [
      {
        name: "\u200B",
        value: data.fields.topByCapacity.description,
        inline: false,
      },
      {
        name: topByCapacity.node0.description,
        value: topByCapacity.node0.value,
        inline: false,
      },
      {
        name: topByCapacity.node1.description,
        value: topByCapacity.node1.value,
        inline: false,
      },
      {
        name: topByCapacity.node2.description,
        value: topByCapacity.node2.value,
        inline: false,
      },
      {
        name: "\u200B",
        value: data.fields.topByChannels.description,
        inline: false,
      },
      {
        name: topByChannels.node0.description,
        value: topByChannels.node0.value,
        inline: false,
      },
      {
        name: topByChannels.node1.description,
        value: topByChannels.node1.value,
        inline: false,
      },
      {
        name: topByChannels.node2.description,
        value: topByChannels.node2.value,
        inline: false,
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
