import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import axios from "axios";
import { Utils } from "../utils";

const SERVICE_MURRAY_URL = process.env.SERVICE_MURRAY_URL;

export const deployNodeStatsCommand = () => {
  return new SlashCommandBuilder()
    .setName("node-stats")
    .setDescription("Show lightning node stats")
    .addStringOption((option) =>
      option
        .setName("pubkey")
        .setDescription("Node public key or alias")
        .setRequired(true)
    );
};

export async function NodeStatsCommand(
  interaction: CommandInteraction
): Promise<void> {
  try {
    const { options } = interaction;

    const pk = options.data[0].value;

    const url = `${SERVICE_MURRAY_URL}/lightning/node/${pk}`;
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

    const topChannels = data.fields.topChannels.value;
    const pubkey = data.fields.pubkey.value;

    const fields = [
      {
        name: pubkey.id.description,
        value: pubkey.id.value,
        inline: false,
      },
      {
        name: pubkey.url.description,
        value: pubkey.url.value,
        inline: false,
      },
      {
        name: data.fields.channels.description,
        value: data.fields.channels.value,
        inline: true,
      },
      {
        name: data.fields.capacity.description,
        value: data.fields.capacity.value,
        inline: true,
      },
      { name: "\u200B", value: "\u200B", inline: true },
      {
        name: data.fields.firstSeen.description,
        value: data.fields.firstSeen.value,
        inline: true,
      },
      {
        name: data.fields.updated.description,
        value: data.fields.updated.value,
        inline: true,
      },
      { name: "\u200B", value: "\u200B", inline: true },
      {
        name: topChannels.peer.description,
        value: topChannels.peer.value,
        inline: true,
      },
      {
        name: topChannels.capacity.description,
        value: topChannels.capacity.value,
        inline: true,
      },
      {
        name: topChannels.fee.description,
        value: topChannels.fee.value,
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
