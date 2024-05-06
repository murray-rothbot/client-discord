import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import axios from "axios";
import { Utils } from "../utils";

const SERVICE_MURRAY_URL = process.env.SERVICE_MURRAY_URL;

export const deployMarketCapCommand = () => {
  return new SlashCommandBuilder()
    .setName("market-cap")
    .setDescription("Statistics about the Lightning Network");
};

export async function marketCapCommand(
  interaction: CommandInteraction
): Promise<void> {
  try {
    const url = `${SERVICE_MURRAY_URL}/market/capitalization`;
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

    const priceUsd = data.fields.btcusd.value.price;
    const satsPerFiatUsd = data.fields.btcusd.value.satsPerFiat;
    const marketCapUsd = data.fields.btcusd.value.marketCap;

    const priceBrl = data.fields.btcbrl.value.price;
    const satsPerFiatBrl = data.fields.btcbrl.value.satsPerFiat;
    const marketCapBrl = data.fields.btcbrl.value.marketCap;

    const fields = [
      {
        name: priceUsd.description,
        value: priceUsd.value,
        inline: true,
      },
      {
        name: satsPerFiatUsd.description,
        value: satsPerFiatUsd.value,
        inline: true,
      },
      {
        name: marketCapUsd.description,
        value: marketCapUsd.value,
        inline: true,
      },
      {
        name: priceBrl.description,
        value: priceBrl.value,
        inline: true,
      },
      {
        name: satsPerFiatBrl.description,
        value: satsPerFiatBrl.value,
        inline: true,
      },
      {
        name: marketCapBrl.description,
        value: marketCapBrl.value,
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
