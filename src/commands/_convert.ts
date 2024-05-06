import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import axios from "axios";
import { Utils } from "../utils";

const SERVICE_MURRAY_URL = process.env.SERVICE_MURRAY_URL;

export const deployConvertCommand = () => {
  return new SlashCommandBuilder()
    .setName("convert")
    .setDescription("Convert prices")
    .addIntegerOption((option) =>
      option
        .setName("value")
        .setDescription("Value to convert from")
        .setRequired(true)
        .setMinValue(0)
    )
    .addStringOption((option) =>
      option
        .setName("currency")
        .setDescription("Current to convert from")
        .setRequired(true)
        .setChoices(
          {
            name: "BTC",
            value: "btc",
          },
          { name: "SAT", value: "sat" },
          { name: "USD", value: "usd" },
          { name: "BRL", value: "brl" }
        )
    );
};

export async function convertCommand(
  interaction: CommandInteraction
): Promise<void> {
  try {
    const { options } = interaction;

    const value = options.data[0].value;
    const currency = options.data[1].value;

    const url = `${SERVICE_MURRAY_URL}/prices/convert?value=${value}&currency=${currency}`;
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
        name: data.fields.height.description,
        value: data.fields.height.value,
        inline: false,
      },
      {
        name: data.fields.timestamp.description,
        value: data.fields.timestamp.value,
        inline: false,
      },
      {
        name: data.fields.txCount.description,
        value: data.fields.txCount.value,
        inline: false,
      },
      {
        name: data.fields.size.description,
        value: data.fields.size.value,
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
