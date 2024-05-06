import { createCron } from "./_createCron";
import { createResponse } from "./_createResponse";
import { logMurray } from "./_logMurray";

interface IUtils {
  createResponse: typeof createResponse;
  createCron: typeof createCron;
  logMurray: typeof logMurray;
}

export const Utils: IUtils = {
  createResponse,
  createCron,
  logMurray,
};
