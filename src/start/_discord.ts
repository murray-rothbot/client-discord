import "dotenv/config";

import { Client, GatewayIntentBits } from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { commands as cmds } from "../commands/index";

const CLIENT_ID = process.env.CLIENT_ID || "";
const GUILD_ID = process.env.GUILD_ID || "";
const DISCORD_TOKEN = process.env.DISCORD_TOKEN || "";

const commands = cmds.deployCommands.map((command) => command.toJSON());

export const Discord = async (): Promise<Client | null> => {
  try {
    const client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildPresences,
      ],
    });

    client.login(DISCORD_TOKEN);

    await deployCommands();

    return client;
  } catch (error) {
    console.error(`start: ${error}`);
    return null;
  }
};

const deployCommands = async () => {
  try {
    const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);

    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: commands,
    });

    console.log("Deployed commands");
  } catch (error) {
    console.error(error);
  }
};
