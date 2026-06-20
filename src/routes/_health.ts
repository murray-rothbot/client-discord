import { Client } from "discord.js";
import { Application } from "express";

export const health = async ({ app, client }: { app: Application; client: Client }) => {
  app.get("/health", async (_, res) => {
    try {
      if (!client.isReady()) {
        return res.status(503).send(`Discord client not ready`);
      }

      res.status(200).send(`OK`);
    } catch (error) {
      console.log(error);
      res.status(500).send(`NOK`);
    }
  });
};
