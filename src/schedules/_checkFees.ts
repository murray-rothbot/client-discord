import axios from "axios";
import { ActivityType, Client } from "discord.js";

const SERVICE_MURRAY_URL = process.env.SERVICE_MURRAY_URL;

export const checkFees = {
  cron: "10,30,50 * * * * *",
  action: async ({ client }: { client: Client }): Promise<void> => {
    try {
      const url = `${SERVICE_MURRAY_URL}/blockchain/fees/recommended`;
      const result = await axios.get(url);
      const { data } = result.data;

      const fastestFee = `fees: ${data.fields.fastestFee.value}`;

      if (client.user) {
        client.user.setActivity(fastestFee, {
          type: ActivityType.Watching,
        });
      }
    } catch (error) {
      console.log(error);
    }
  },
};
