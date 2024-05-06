import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import axios from "axios";
import { Utils } from "../utils";

const SERVICE_MURRAY_URL = process.env.SERVICE_MURRAY_URL;

export const deployBlockCommand = () => {
  return new SlashCommandBuilder()
    .setName("block")
    .setDescription("Show bitcoin block stats")
    .addStringOption((option) =>
      option.setName("hash").setDescription("Block hash")
    )
    .addIntegerOption((option) =>
      option.setName("height").setDescription("Block height")
    );
};

export async function blockCommand(
  interaction: CommandInteraction
): Promise<void> {
  try {
    const { options } = interaction;

    let height;
    let hash;
    let url = `${SERVICE_MURRAY_URL}/blockchain/block`;

    for (const option of options.data) {
      if (option.name === "height") {
        height = option.value;
        url = `${url}?height=${height}`;
      }
      if (option.name === "hash") {
        hash = option.value;
        url = `${url}?hash=${hash}`;
      }
    }

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

    data.description = "Block stats";
    data.title = "Block";

    const hashField = data.fields.hash.value;

    const fields = [
      {
        name: hashField.id.description,
        value: hashField.id.value,
        inline: false,
      },
      {
        name: hashField.url.description,
        value: hashField.url.value,
        inline: false,
      },
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
      {
        name: data.fields.weight.description,
        value: data.fields.weight.value,
        inline: false,
      },
      {
        name: data.fields.difficulty.description,
        value: data.fields.difficulty.value,
        inline: false,
      },
      {
        name: data.fields.merkleRoot.description,
        value: data.fields.merkleRoot.value,
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
