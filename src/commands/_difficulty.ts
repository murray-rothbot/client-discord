import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import axios from "axios";
import { Utils } from "../utils";

const SERVICE_MURRAY_URL = process.env.SERVICE_MURRAY_URL;

export const deployDifficultyCommand = () => {
  return new SlashCommandBuilder()
    .setName("difficulty")
    .setDescription("Difficulty adjustment and hashrate information");
};

export function progressBar(
  filled = 0,
  size = 20,
  filledIcon = "🟩",
  emptyIcon = "⬜"
) {
  return (
    filledIcon.repeat(filled) + emptyIcon.repeat(Math.max(0, size - filled))
  );
}

export async function difficultyCommand(
  interaction: CommandInteraction
): Promise<void> {
  try {
    const url = `${SERVICE_MURRAY_URL}/blockchain/difficulty`;
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

    const barSize = 25;
    data.fields.currentProgress.value = progressBar(
      Math.floor((data.fields.currentProgress.value / 100) * barSize),
      barSize
    );

    data.fields.estimatedDate.value = `<t:${Math.floor(
      data.fields.estimatedDate.value / 1000
    )}:R>`;

    const fields = [
      {
        name: data.fields.currentProgress.description,
        value: data.fields.currentProgress.value,
        inline: false,
      },
      {
        name: data.fields.estimatedDate.description,
        value: data.fields.estimatedDate.value,
        inline: true,
      },
      {
        name: data.fields.estimateChange.description,
        value: data.fields.estimateChange.value,
        inline: true,
      },
      {
        name: data.fields.previousChange.description,
        value: data.fields.previousChange.value,
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
