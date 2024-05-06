import axios from "axios";
import { ActivityType, Client } from "discord.js";

const SERVICE_MURRAY_URL = process.env.SERVICE_MURRAY_URL;

export const checkPrices = {
  cron: "0,20,40 * * * * *",
  action: async ({ client }: { client: Client }): Promise<void> => {
    try {
      const url = `${SERVICE_MURRAY_URL}/prices/raw`;
      const result = await axios.get(url);
      const { data } = result.data;

      if (client.user) {
        const priceChangeUSD = data.USD.priceChangePercent <= 0 ? "▼" : "▲";
        const priceChangeBRL = data.BRL.priceChangePercent <= 0 ? "▼" : "▲";
        const msg = `${priceChangeUSD}$${data.USD.formattedLastPrice} ${priceChangeBRL}R$${data.BRL.formattedLastPrice}`;
        const status = data.USD.priceChangePercent <= 0 ? "dnd" : "online";

        client.user.setStatus(status);
        client.user.setActivity(msg, {
          type: ActivityType.Playing,
        });
      }
    } catch (error) {
      console.log(error);
    }
  },
};
