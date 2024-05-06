import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import axios from "axios";
import { Utils } from "../utils";

const SERVICE_MURRAY_URL = process.env.SERVICE_MURRAY_URL;

export const deployAddressCommand = () => {
  return new SlashCommandBuilder()
    .setName("address")
    .setDescription("Show address info")
    .addStringOption((option) =>
      option
        .setName("address")
        .setDescription("An address hash")
        .setRequired(true)
    );
};

export async function addressCommand(
  interaction: CommandInteraction
): Promise<void> {
  try {
    const { options } = interaction;

    const address = options.data[0].value;

    const url = `${SERVICE_MURRAY_URL}/blockchain/address/${address}`;

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

    data.description = "";
    data.title = data.fields.address.description;

    const fields = [
      {
        name: data.fields.address.value.id.value,
        value: "\u200B",
        inline: false,
      },
      {
        name: data.fields.address.value.url.description,
        value: data.fields.address.value.url.value,
        inline: false,
      },
      {
        name: data.fields.onchain.value.received.description,
        value: data.fields.onchain.value.received.value,
        inline: true,
      },
      {
        name: data.fields.onchain.value.sent.description,
        value: data.fields.onchain.value.sent.value,
        inline: true,
      },
      { name: "\u200B", value: "\u200B", inline: true },
      {
        name: data.fields.mempool.value.received.description,
        value: data.fields.mempool.value.received.value,
        inline: true,
      },
      {
        name: data.fields.mempool.value.sent.description,
        value: data.fields.mempool.value.sent.value,
        inline: true,
      },
      { name: "\u200B", value: "\u200B", inline: true },
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
