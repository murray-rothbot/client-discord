import express from "express";
import { Client } from "discord.js";
import { Routes } from "../routes";

export function Express({ client }: { client: Client }): void {
  try {
    const app = express();
    const PORT = process.env.PORT || 4003;

    app.use(express.json());

    Object.keys(Routes).forEach((key) => {
      (
        Routes as {
          [key: string]: Function;
        }
      )[key]({
        app,
        client,
      });
    });

    app.listen(PORT, () =>
      console.log(`Express server is running on http://localhost:${PORT}`)
    );
  } catch (error) {
    console.log(error);
  }
}
