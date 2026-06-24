import { Client, Message } from "discord.js";
import { askMurrayAiQuestion, extractMemberRoleNames, sendDiscordMessageChunks } from "../commands/_ask";
import {
  buildMurrayAiGuildOnlyMessage,
  formatMurrayAiPublicAnswer,
  isMurrayAiAllowedGuildContext,
  findMurrayAiQuestionAuthorIdInThreadIntro,
  getMurrayAiThreadQuestionAuthor,
  registerMurrayAiThreadQuestionAuthor,
  isMurrayAiThreadName,
  shouldAnswerMurrayAiMentionMessage,
  shouldAnswerMurrayAiThreadMessage,
  splitDiscordMessage,
  stripMurrayAiBotMention,
} from "../utils/_murrayAi";

const maybeAnswerMurrayAiMention = async (
  message: Message,
  client: Client,
): Promise<boolean> => {
  if (!client.user) return false;

  if (!isMurrayAiAllowedGuildContext(message.guildId)) {
    if (message.mentions.users.has(client.user.id)) {
      await message.reply(buildMurrayAiGuildOnlyMessage());
      return true;
    }
    return false;
  }

  const mentionsBot = message.mentions.users.has(client.user.id);
  const shouldAnswer = shouldAnswerMurrayAiMentionMessage({
    isBotAuthor: message.author.bot,
    mentionsBot,
    content: message.content,
  });

  if (!shouldAnswer) return false;

  const question = stripMurrayAiBotMention(message.content, client.user.id);
  await (message.channel as any).sendTyping?.();

  const result = await askMurrayAiQuestion({
    userId: message.author.id,
    channel: message.channel,
    question: question || message.content,
    memberRoleNames: extractMemberRoleNames(message.member),
  });

  const answer = result.active && !result.limited
    ? formatMurrayAiPublicAnswer({
        question: question || message.content,
        answer: result.answer,
        askedBy: message.author.username,
      })
    : result.answer;

  const chunks = splitDiscordMessage(answer);
  await sendDiscordMessageChunks({
    message,
    chunks,
    question: question || message.content,
    shouldCreateThread: result.active && !result.limited,
    questionAuthorId: message.author.id,
  });
  return true;
};

const resolveMurrayAiThreadQuestionAuthorId = async (
  channel: any,
  client: Client,
): Promise<string | undefined> => {
  const cachedAuthorId = getMurrayAiThreadQuestionAuthor(channel.id);
  if (cachedAuthorId) return cachedAuthorId;

  const fetchedMessages = await channel.messages
    ?.fetch?.({ limit: 10 })
    .catch(() => null);
  const values = typeof fetchedMessages?.values === "function"
    ? fetchedMessages.values()
    : [];
  const recoveredAuthorId = findMurrayAiQuestionAuthorIdInThreadIntro(values, client.user?.id);
  if (recoveredAuthorId) registerMurrayAiThreadQuestionAuthor(channel.id, recoveredAuthorId);
  return recoveredAuthorId;
};

const maybeAnswerMurrayAiThread = async (
  message: Message,
  client: Client,
): Promise<boolean> => {
  const channel = message.channel as any;
  const isMurrayAiThread = Boolean(channel?.isThread?.() && isMurrayAiThreadName(channel.name));

  if (!isMurrayAiThread) return false;

  const mentionsBot = Boolean(client.user && message.mentions.users.has(client.user.id));
  let repliesToBot = false;
  let repliesToOtherUser = false;

  if (message.reference?.messageId && client.user) {
    const referencedMessage = await message.channel.messages
      .fetch(message.reference.messageId)
      .catch(() => null);
    repliesToBot = referencedMessage?.author.id === client.user.id;
    repliesToOtherUser = Boolean(referencedMessage && referencedMessage.author.id !== client.user.id);
  }

  const questionAuthorId = await resolveMurrayAiThreadQuestionAuthorId(channel, client);
  const mentionsOtherUsers = client.user
    ? message.mentions.users.some((user) => user.id !== client.user!.id)
    : message.mentions.users.size > 0;

  const shouldAnswer = shouldAnswerMurrayAiThreadMessage({
    isBotAuthor: message.author.bot,
    isMurrayAiThread,
    mentionsBot,
    repliesToBot,
    isQuestionAuthor: Boolean(questionAuthorId && message.author.id === questionAuthorId),
    mentionsOtherUsers,
    repliesToOtherUser,
    content: message.content,
  });

  if (!shouldAnswer) return true;

  const question = client.user
    ? stripMurrayAiBotMention(message.content, client.user.id)
    : message.content.trim();

  await channel.sendTyping?.();

  const result = await askMurrayAiQuestion({
    userId: message.author.id,
    channel,
    question: question || message.content,
    memberRoleNames: extractMemberRoleNames(message.member),
  });

  const chunks = splitDiscordMessage(result.answer);
  await message.reply(chunks[0]);
  for (const chunk of chunks.slice(1)) {
    await channel.send(chunk);
  }
  return true;
};

export const messageCreate = async ({
  client,
}: {
  client: Client;
}): Promise<void> => {
  try {
    client.on("messageCreate", async (message) => {
      try {
        const handledByMurrayAiThread = await maybeAnswerMurrayAiThread(message, client);
        if (handledByMurrayAiThread) return;

        const handledByMurrayAiMention = await maybeAnswerMurrayAiMention(message, client);
        if (handledByMurrayAiMention) return;
      } catch (error) {
        console.log(`events/messageCreate/response: ${error}`);
      }
    });
  } catch (error) {
    console.log(`events/messageCreate: ${error}`);
  }
};
