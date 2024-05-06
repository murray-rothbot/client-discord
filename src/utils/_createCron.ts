import { CronJob } from "cron";

export const createCron = async ({
  cron,
  action,
}: {
  cron: string;
  action: () => void;
}): Promise<CronJob<null, null>> => {
  const jobPrices = new CronJob(cron, action, null, true, "America/Sao_Paulo");
  jobPrices.start();
  return jobPrices;
};
