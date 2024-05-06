import { Start } from "./start";

const init = async () => {
  try {
    const client = await Start.Discord();

    if (client) {
      Start.Events({ client });
      Start.Express({ client });
      Start.Schedules({ client });
    }
  } catch (error) {
    console.error(`start: ${error}`);
    setTimeout(() => {
      init();
    }, 5000);
  }
};

init();
