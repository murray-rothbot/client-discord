import { Client } from "discord.js";
import { Application } from "express";

export const health = async ({ app }: { app: Application; client: Client }) => {
  app.get("/health", async (_, res) => {
    try {
      res.status(200).send(`OK`);
    } catch (error) {
      console.log(error);
      res.status(500).send(`NOK`);
    }
  });
};
