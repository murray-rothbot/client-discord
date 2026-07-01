import assert from "assert";
import { sendAskCommandChunks, sendDiscordMessageChunks } from "../src/commands/_ask";

const sentToThread: string[] = [];
const followUps: string[] = [];
const editedReplies: string[] = [];
let startedThreadName = "";

const replyMessage = {
  channel: { isThread: () => false },
  startThread: async ({ name }: { name: string }) => {
    startedThreadName = name;
    return {
      send: async (message: string) => {
        sentToThread.push(message);
      },
    };
  },
};

(async () => {
await sendAskCommandChunks({
  interaction: {
    editReply: async (message: string) => {
      editedReplies.push(message);
      return replyMessage;
    },
    followUp: async (message: string) => {
      followUps.push(message);
    },
  } as any,
  chunks: ["primeira parte", "segunda parte", "terceira parte"],
  question: "explica drivechains em detalhes",
  shouldCreateThread: true,
});

assert.deepEqual(editedReplies, ["primeira parte"]);
assert.deepEqual(followUps, []);
assert.ok(startedThreadName.includes("drivechains"));
assert.equal(
  sentToThread[0],
  "Pode continuar a conversa aqui na thread — é só responder normalmente, sem repetir `/ask`.",
);
assert.deepEqual(sentToThread.slice(1), ["segunda parte", "terceira parte"]);


const mentionThreadMessages: string[] = [];
const mentionReplies: string[] = [];
let mentionThreadName = "";
const mentionMessage = {
  channel: {
    isThread: () => false,
    send: async (message: string) => {
      throw new Error(`mention answers should stay in the thread, tried channel.send: ${message}`);
    },
  },
  startThread: async ({ name }: { name: string }) => {
    mentionThreadName = name;
    return {
      send: async (message: string) => {
        mentionThreadMessages.push(message);
      },
    };
  },
  reply: async (message: string) => {
    mentionReplies.push(message);
    return replyMessage;
  },
};

await sendDiscordMessageChunks({
  message: mentionMessage as any,
  chunks: ["resposta completa parte 1", "resposta completa parte 2"],
  question: "@Murray Rothbot isso é spy?",
  shouldCreateThread: true,
  questionAuthorId: "user-123",
});
assert.ok(mentionThreadName.includes("spy"));
assert.deepEqual(mentionReplies, [], "mention-triggered Murray AI answers should not post the answer in the main channel");
assert.equal(
  mentionThreadMessages[0],
  "Pode continuar a conversa aqui na thread — <@user-123> pode fazer follow-up sem repetir `/ask`.",
);
assert.deepEqual(mentionThreadMessages.slice(1), ["resposta completa parte 1", "resposta completa parte 2"]);

const limitedFollowUps: string[] = [];
await sendAskCommandChunks({
  interaction: {
    editReply: async () => replyMessage,
    followUp: async (message: string) => {
      limitedFollowUps.push(message);
    },
  } as any,
  chunks: ["limite parte 1", "limite parte 2"],
  question: "limite",
  shouldCreateThread: false,
});
assert.deepEqual(limitedFollowUps, ["limite parte 2"]);

console.log("askCommandReplyFlow tests passed");
})();
