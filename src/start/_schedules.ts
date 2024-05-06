import { Client } from "discord.js";
import { Schedules as S } from "../schedules";
import { Utils } from "../utils";

export const Schedules = async ({
  client,
}: {
  client: Client;
}): Promise<void> => {
  Object.keys(S).forEach((key) => {
    const schedule = S[key as keyof typeof S];
    if (schedule) {
      Utils.createCron({
        cron: schedule.cron,
        action: () => schedule.action({ client }),
      });
    }
  });
};
