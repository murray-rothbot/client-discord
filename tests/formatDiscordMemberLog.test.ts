import assert from "assert";
import { formatDiscordCommandLog } from "../src/utils/_formatDiscordMemberLog";

const fixedNow = new Date("2026-06-23T16:33:00.000Z");
const joinedAt = new Date("2026-06-01T12:00:00.000Z");
const createdAt = new Date("2020-01-02T03:04:05.000Z");

const member = {
  id: "123456789012345678",
  displayName: "Murray no Servidor",
  joinedAt,
  user: {
    id: "123456789012345678",
    username: "murray_user",
    globalName: "Murray Global",
    tag: "murray_user#1234",
    bot: false,
    createdAt,
  },
};

function assertIncludesAll(value: string, expected: string[]) {
  for (const part of expected) {
    assert.ok(value.includes(part), `Expected log to include ${part}\nActual:\n${value}`);
  }
}

const log = formatDiscordCommandLog("prices", member, { now: fixedNow });
assertIncludesAll(log, [
  ":robot: `/prices` command executed by <@123456789012345678>",
  "**Usuário:** <@123456789012345678>",
  "**Username:** `murray_user`",
  "**Tag:** `murray_user#1234`",
  "**Nome global:** Murray Global",
  "**Nome no servidor:** Murray no Servidor",
  "**ID:** `123456789012345678`",
  "**Conta criada:** <t:1577934245:F> (<t:1577934245:R>)",
  "**Entrou no servidor:** <t:1780315200:F> (<t:1780315200:R>)",
  "**Executado em:** <t:1782232380:F> (<t:1782232380:R>)",
  "**Bot:** não",
]);

console.log("formatDiscordMemberLog tests passed");
