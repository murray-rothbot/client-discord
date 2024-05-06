import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import axios from "axios";
import { Utils } from "../utils";

const SERVICE_MURRAY_URL = process.env.SERVICE_MURRAY_URL;

export const deployTransactionCommand = () => {
  return new SlashCommandBuilder()
    .setName("transaction")
    .setDescription("Show transaction info")
    .addStringOption((option) =>
      option.setName("txid").setDescription("An txid hex").setRequired(true)
    );
};

export async function transactionCommand(
  interaction: CommandInteraction
): Promise<void> {
  try {
    const { options } = interaction;

    const txid = options.data[0].value;

    const url = `${SERVICE_MURRAY_URL}/blockchain/tx/${txid}`;

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
        name: data.fields.hash.value.id.value,
        value: "\u200B",
        inline: false,
      },
      {
        name: data.fields.inputs.description,
        value: data.fields.inputs.value,
        inline: true,
      },
      {
        name: data.fields.outputs.description,
        value: data.fields.outputs.value,
        inline: true,
      },
      { name: "\u200B", value: "\u200B", inline: true },
      {
        name: data.fields.fees.description,
        value: data.fields.fees.value,
        inline: false,
      },
      {
        name: data.fields.size.description,
        value: data.fields.size.value,
        inline: true,
      },
      {
        name: data.fields.weight.description,
        value: data.fields.weight.value,
        inline: true,
      },
      { name: "\u200B", value: "\u200B", inline: true },
      {
        name: data.fields.confirmed.description,
        value: data.fields.confirmed.value,
        inline: true,
      },
      {
        name: data.fields.rbf.description,
        value: `${data.fields.rbf.value}`,
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
