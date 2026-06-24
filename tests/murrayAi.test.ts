import { getOligarcaStatusBaseUrl, isMurrayAiUnlimitedUser } from "../src/commands/_ask";
import assert from "assert";
import {
  buildMurrayAiContext,
  buildMurrayAiFallbackAnswer,
  buildMurrayAiPrompt,
  buildMurrayAiThreadName,
  formatMurrayAiPublicAnswer,
  canUseMurrayAiToday,
  getMurrayAiPlan,
  isMurrayAiAllowedGuildContext,
  isMurrayAiThreadName,
  sanitizeMurrayAiAnswer,
  shouldAnswerMurrayAiMentionMessage,
  shouldAnswerMurrayAiThreadMessage,
  stripMurrayAiBotMention,
  splitDiscordMessage,
} from "../src/utils/_murrayAi";


const previousOligarcaUrl = process.env.SERVICE_OLIGARCA_URL;
const previousTbdUrl = process.env.SERVICE_TBD_URL;
const previousMurrayUrl = process.env.SERVICE_MURRAY_URL;
process.env.SERVICE_MURRAY_URL = "http://backend-murray:5000";
delete process.env.SERVICE_TBD_URL;
delete process.env.SERVICE_OLIGARCA_URL;
assert.equal(getOligarcaStatusBaseUrl(), "http://backend-murray:5000");
process.env.SERVICE_TBD_URL = "http://backend-tbd:5001";
assert.equal(getOligarcaStatusBaseUrl(), "http://backend-tbd:5001");
process.env.SERVICE_OLIGARCA_URL = "http://oligarca:5001";
assert.equal(getOligarcaStatusBaseUrl(), "http://oligarca:5001");
if (previousOligarcaUrl === undefined) delete process.env.SERVICE_OLIGARCA_URL; else process.env.SERVICE_OLIGARCA_URL = previousOligarcaUrl;
if (previousTbdUrl === undefined) delete process.env.SERVICE_TBD_URL; else process.env.SERVICE_TBD_URL = previousTbdUrl;
if (previousMurrayUrl === undefined) delete process.env.SERVICE_MURRAY_URL; else process.env.SERVICE_MURRAY_URL = previousMurrayUrl;

const plan = getMurrayAiPlan();
assert.equal(plan.monthlySats, 14900);
assert.equal(plan.maxBrl, 49);
assert.equal(plan.dailyAskLimit, 5);
assert.equal(plan.contextMessageLimit, 60);
assert.ok(plan.maxAnswerChars >= 1200);

assert.equal(canUseMurrayAiToday(0, plan), true);
assert.equal(canUseMurrayAiToday(4, plan), true);
assert.equal(canUseMurrayAiToday(5, plan), false);
assert.equal(isMurrayAiUnlimitedUser("227478941089136641"), true);
assert.equal(isMurrayAiUnlimitedUser("123"), false);


const context = buildMurrayAiContext([
  {
    authorName: "Miguel",
    content: "Acho que drivechains permitem experimentação sem mexer no L1.",
    createdAt: new Date("2026-06-23T17:00:00.000Z"),
    bot: false,
  },
  {
    authorName: "Satoshi Nakabot",
    content: "mensagem de bot que deve sair",
    createdAt: new Date("2026-06-23T17:01:00.000Z"),
    bot: true,
  },
  {
    authorName: "João",
    content: "@everyone eu discordo por causa do risco de centralização.",
    createdAt: new Date("2026-06-23T17:02:00.000Z"),
    bot: false,
  },
]);

assert.deepEqual(context, [
  "[17:00] Miguel: Acho que drivechains permitem experimentação sem mexer no L1.",
  "[17:02] João: @\u200beveryone eu discordo por causa do risco de centralização.",
]);

const prompt = buildMurrayAiPrompt("o que são drivechains?", []);
assert.ok(prompt.includes("especialista técnico em Bitcoin"));
assert.ok(prompt.includes("Drivechain"));
assert.ok(prompt.includes("conhecimento geral"));
assert.ok(!prompt.includes("Use apenas o contexto fornecido"));
assert.ok(prompt.includes("Se precisar de informação atual"));

const answer = buildMurrayAiFallbackAnswer("qual foi o debate?", context, plan);
assert.ok(answer.includes("Murray AI"));
assert.ok(answer.includes("qual foi o debate?"));
assert.ok(answer.includes("Contexto analisado"));
assert.ok(answer.length <= plan.maxAnswerChars);

const genericFallback = buildMurrayAiFallbackAnswer("oq sao drivechains?", [
  "[01:25] Miguel: vc sabe oq sao drivechains?",
], plan);
assert.ok(genericFallback.includes("O provider LLM não respondeu"));
assert.ok(!genericFallback.includes("BIP300"));

assert.equal(
  sanitizeMurrayAiAnswer("oi @everyone e @here <@123>"),
  "oi @\u200beveryone e @\u200bhere <@123>",
);

const threadName = buildMurrayAiThreadName("Me explica o consenso dessa thread sobre covenants com muitos detalhes, por favor");
assert.ok(threadName.startsWith("🧠 Murray AI · "));
assert.ok(threadName.length <= 90);
assert.equal(isMurrayAiThreadName(threadName), true);
assert.equal(isMurrayAiThreadName("debate normal"), false);
assert.equal(isMurrayAiThreadName("Murray AI · sem emoji"), true);


assert.equal(isMurrayAiAllowedGuildContext("bitcoin-discord", "bitcoin-discord"), true);
assert.equal(isMurrayAiAllowedGuildContext("other-server", "bitcoin-discord"), false);
assert.equal(isMurrayAiAllowedGuildContext(undefined, "bitcoin-discord"), false);
assert.equal(isMurrayAiAllowedGuildContext(null, "bitcoin-discord"), false);
assert.equal(isMurrayAiAllowedGuildContext("any-guild", undefined), true);


assert.equal(
  shouldAnswerMurrayAiThreadMessage({
    isBotAuthor: false,
    isMurrayAiThread: true,
    mentionsBot: false,
    repliesToBot: false,
    content: "taí funcionando",
  }),
  false,
);
assert.equal(
  shouldAnswerMurrayAiThreadMessage({
    isBotAuthor: false,
    isMurrayAiThread: true,
    mentionsBot: true,
    repliesToBot: false,
    content: "@bot quais as chances?",
  }),
  true,
);
assert.equal(
  shouldAnswerMurrayAiThreadMessage({
    isBotAuthor: false,
    isMurrayAiThread: true,
    mentionsBot: false,
    repliesToBot: true,
    content: "quais as chances?",
  }),
  true,
);

assert.equal(
  shouldAnswerMurrayAiThreadMessage({
    isBotAuthor: false,
    isMurrayAiThread: true,
    mentionsBot: false,
    repliesToBot: false,
    isQuestionAuthor: true,
    mentionsOtherUsers: false,
    repliesToOtherUser: false,
    content: "e quais são os riscos disso?",
  }),
  true,
);
assert.equal(
  shouldAnswerMurrayAiThreadMessage({
    isBotAuthor: false,
    isMurrayAiThread: true,
    mentionsBot: false,
    repliesToBot: false,
    isQuestionAuthor: true,
    mentionsOtherUsers: false,
    repliesToOtherUser: false,
    content: "entendi, valeu",
  }),
  false,
);
assert.equal(
  shouldAnswerMurrayAiThreadMessage({
    isBotAuthor: false,
    isMurrayAiThread: true,
    mentionsBot: false,
    repliesToBot: false,
    isQuestionAuthor: true,
    mentionsOtherUsers: true,
    repliesToOtherUser: false,
    content: "@joao o que você acha?",
  }),
  false,
);
assert.equal(
  shouldAnswerMurrayAiThreadMessage({
    isBotAuthor: false,
    isMurrayAiThread: true,
    mentionsBot: false,
    repliesToBot: false,
    isQuestionAuthor: false,
    mentionsOtherUsers: false,
    repliesToOtherUser: false,
    content: "e quais são os riscos disso?",
  }),
  false,
);

assert.equal(
  shouldAnswerMurrayAiThreadMessage({
    isBotAuthor: true,
    isMurrayAiThread: true,
    mentionsBot: true,
    repliesToBot: true,
    content: "loop",
  }),
  false,
);


const longMessage = `Intro\n\n${"a".repeat(1200)}\n\n${"b".repeat(1200)}\n\n${"c".repeat(1200)}`;
const chunks = splitDiscordMessage(longMessage, 1900);
assert.ok(chunks.length > 1);
assert.ok(chunks.every((chunk) => chunk.length <= 1900));
assert.ok(chunks.join("\n").includes("Intro"));


const publicAnswer = formatMurrayAiPublicAnswer({
  question: "oq sao drivechains?",
  answer: "Drivechains são sidechains para Bitcoin.",
  askedBy: "Miguel",
});
assert.ok(publicAnswer.startsWith("🧠 **Pergunta de Miguel:** oq sao drivechains?"));
assert.ok(publicAnswer.includes("Drivechains são sidechains"));

console.log("murrayAi tests passed");
