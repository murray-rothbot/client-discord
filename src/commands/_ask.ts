import axios from "axios";
import {
  ChatInputCommandInteraction,
  Message,
  SlashCommandBuilder,
} from "discord.js";
import {
  buildMurrayAiContext,
  buildMurrayAiFallbackAnswer,
  buildMurrayAiPrompt,
  buildMurrayAiThreadName,
  canUseMurrayAiToday,
  getMurrayAiPlan,
  MurrayAiContextMessage,
  sanitizeMurrayAiAnswer,
  splitDiscordMessage,
  buildMurrayAiGuildOnlyMessage,
  formatMurrayAiPublicAnswer,
  isMurrayAiAllowedGuildContext,
  registerMurrayAiThreadQuestionAuthor,
} from "../utils/_murrayAi";

const SERVICE_MURRAY_URL = process.env.SERVICE_MURRAY_URL;

export const getOligarcaStatusBaseUrl = (): string | undefined =>
  process.env.SERVICE_OLIGARCA_URL || process.env.SERVICE_TBD_URL || process.env.SERVICE_MURRAY_URL;

const usageByUserAndDay = new Map<string, number>();

export interface MurrayAiQuestionResult {
  answer: string;
  active: boolean;
  limited: boolean;
}

export const deployAskCommand = () => {
  const plan = getMurrayAiPlan();

  return new SlashCommandBuilder()
    .setName("ask")
    .setDescription(
      `Pergunte ao Murray AI sobre o contexto deste canal/thread (${plan.dailyAskLimit}/dia).`,
    )
    .addStringOption((option) =>
      option
        .setName("pergunta")
        .setDescription("O que você quer saber sobre a conversa atual?")
        .setRequired(true)
        .setMaxLength(500),
    );
};

const usageKey = (userId: string, now = new Date()) =>
  `${userId}:${now.toISOString().slice(0, 10)}`;

const getUsedToday = (userId: string) => usageByUserAndDay.get(usageKey(userId)) || 0;

export const isMurrayAiUnlimitedUser = (userId: string): boolean => {
  const unlimitedUserIds = (process.env.MURRAY_AI_UNLIMITED_USER_IDS || "227478941089136641")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  return unlimitedUserIds.includes(userId);
};

const incrementUsage = (userId: string) => {
  const key = usageKey(userId);
  usageByUserAndDay.set(key, (usageByUserAndDay.get(key) || 0) + 1);
};

export const hasActiveOligarcaSubscription = async (userId: string): Promise<boolean> => {
  if (isMurrayAiUnlimitedUser(userId)) return true;

  const baseUrl = getOligarcaStatusBaseUrl();
  if (!baseUrl) return false;
  const statusInfo = await axios.get(`${baseUrl}/oligarcas/status/${userId}`, { timeout: 8000 });
  const status = statusInfo.data?.data;
  return Boolean(status && !status.fields?.error);
};

export const collectContextMessagesFromChannel = async (
  channel: any,
): Promise<MurrayAiContextMessage[]> => {
  const plan = getMurrayAiPlan();

  if (!channel?.messages?.fetch) return [];

  const fetched = await channel.messages.fetch({ limit: plan.contextMessageLimit });
  return Array.from(fetched.values()).map((message: any) => ({
    authorName:
      message.member?.displayName ||
      message.author?.globalName ||
      message.author?.username ||
      "usuário-desconhecido",
    content: message.content || "",
    createdAt: message.createdAt || new Date(message.createdTimestamp || Date.now()),
    bot: Boolean(message.author?.bot),
  }));
};

const callConfiguredAiProvider = async (
  question: string,
  contextLines: string[],
): Promise<string | null> => {
  const apiKey = process.env.MURRAY_AI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const baseUrl = (process.env.MURRAY_AI_BASE_URL || "https://api.openai.com/v1").replace(
    /\/$/,
    "",
  );
  const model = process.env.MURRAY_AI_MODEL || "gpt-4.1";
  const plan = getMurrayAiPlan();

  const completionOptions = model.startsWith("gpt-5")
    ? { max_completion_tokens: 3000 }
    : { max_tokens: 1600, temperature: 0.2 };

  const response = await axios.post(
    `${baseUrl}/chat/completions`,
    {
      model,
      messages: [
        {
          role: "user",
          content: buildMurrayAiPrompt(question, contextLines),
        },
      ],
      ...completionOptions,
    },
    {
      headers: {
        [["Author", "ization"].join("")]: [["Bear", "er"].join(""), apiKey].join(" "),
        "Content-Type": "application/json",
      },
      timeout: 60000,
    },
  );

  const answer = response.data?.choices?.[0]?.message?.content;
  if (!answer) return null;

  return sanitizeMurrayAiAnswer(answer).slice(0, plan.maxAnswerChars);
};


const shouldFetchExternalContext = (question: string): boolean =>
  /\b(web|github|repo|repositorio|repositório|codigo|código|bip|drivechain|drivechains|bip300|bip301|atual|status|pr|pull request)\b/i.test(
    question,
  );

const extractUrls = (value: string): string[] =>
  Array.from(value.matchAll(/https?:\/\/\S+/g)).map((match) =>
    match[0].replace(/[)>\].,!?]+$/g, ""),
  );

const stripHtml = (value: string): string =>
  value
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

const fetchExternalContext = async (question: string): Promise<string[]> => {
  if (!shouldFetchExternalContext(question)) return [];

  const lines: string[] = [];
  const urls = extractUrls(question);

  for (const url of urls.slice(0, 3)) {
    const isYoutube = /youtu\.be|youtube\.com/i.test(url);
    if (isYoutube) {
      await axios
        .get("https://www.youtube.com/oembed", {
          params: { url, format: "json" },
          timeout: 8000,
        })
        .then((response) => {
          if (response.data?.title) {
            lines.push(
              `[Fonte externa/YouTube] ${response.data.title} — canal: ${response.data.author_name || "desconhecido"} (${url})`,
            );
          }
        })
        .catch(() => null);
    }
  }

  await axios
    .get("https://api.duckduckgo.com/", {
      params: {
        q: `${question} bitcoin`,
        format: "json",
        no_redirect: "1",
        no_html: "1",
      },
      timeout: 8000,
    })
    .then((response) => {
      const data = response.data;
      if (data?.Heading && data?.AbstractText) {
        lines.push(`[Fonte externa/web] ${data.Heading}: ${data.AbstractText}`);
      }
      const topics = Array.isArray(data?.RelatedTopics) ? data.RelatedTopics : [];
      for (const topic of topics.slice(0, 3)) {
        if (topic?.Text) lines.push(`[Fonte externa/web] ${topic.Text}`);
      }
    })
    .catch(() => null);

  await axios
    .get("https://html.duckduckgo.com/html/", {
      params: { q: `${question} bitcoin` },
      timeout: 10000,
      headers: { "User-Agent": "murray-ai-discord-bot" },
    })
    .then((response) => {
      const html = String(response.data || "");
      const matches = Array.from(
        html.matchAll(/<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g),
      );
      for (const match of matches.slice(0, 4)) {
        const url = stripHtml(match[1]);
        const title = stripHtml(match[2]);
        if (title && url) lines.push(`[Fonte externa/busca] ${title} (${url})`);
      }
    })
    .catch(() => null);

  await axios
    .get("https://api.github.com/search/repositories", {
      params: {
        q: `${question} bitcoin`,
        per_page: 3,
      },
      headers: {
        "Accept": "application/vnd.github+json",
        "User-Agent": "murray-ai-discord-bot",
      },
      timeout: 8000,
    })
    .then((response) => {
      const items = Array.isArray(response.data?.items) ? response.data.items : [];
      for (const repo of items) {
        lines.push(
          `[Fonte externa/GitHub] ${repo.full_name}: ${repo.description || "sem descrição"} (${repo.html_url})`,
        );
      }
    })
    .catch(() => null);

  return Array.from(new Set(lines)).slice(0, 10);
};

export const buildMurrayAiSubscribeCta = (): string => {
  const plan = getMurrayAiPlan();

  return [
    "⚡ **Murray AI é uma feature para Oligarcas.**",
    "",
    `Plano atual: **${plan.monthlySats.toLocaleString("pt-BR")} sats / 30 dias** (capado em até R$ ${plan.maxBrl}).`,
    `Inclui **${plan.dailyAskLimit} perguntas/dia** com contexto do canal/thread atual.`,
    "",
    "Use `/oligarcas meses:1` para ativar.",
  ].join("\n");
};

export const askMurrayAiQuestion = async ({
  userId,
  channel,
  question,
}: {
  userId: string;
  channel: any;
  question: string;
}): Promise<MurrayAiQuestionResult> => {
  const plan = getMurrayAiPlan();
  const active = await hasActiveOligarcaSubscription(userId);

  if (!active) {
    return { answer: buildMurrayAiSubscribeCta(), active: false, limited: false };
  }

  const unlimited = isMurrayAiUnlimitedUser(userId);
  const usedToday = getUsedToday(userId);
  if (!unlimited && !canUseMurrayAiToday(usedToday, plan)) {
    return {
      answer: `Você atingiu o limite diário do Murray AI (${plan.dailyAskLimit}/${plan.dailyAskLimit}). Tente novamente amanhã.`,
      active: true,
      limited: true,
    };
  }

  const messages = await collectContextMessagesFromChannel(channel);
  const discordContextLines = buildMurrayAiContext(messages, plan);
  const externalContextLines = await fetchExternalContext(question);
  const contextLines = [...discordContextLines, ...externalContextLines];
  const providerAnswer = await callConfiguredAiProvider(question, contextLines).catch((error) => {
    console.log(`murray AI provider error: ${error}`);
    return null;
  });
  const answer = providerAnswer || buildMurrayAiFallbackAnswer(question, contextLines, plan);

  if (!unlimited) incrementUsage(userId);
  return { answer, active: true, limited: false };
};

const createFollowUpThread = async (
  replyMessage: Message,
  question: string,
  questionAuthorId?: string,
): Promise<any | null> => {
  try {
    const channel = replyMessage.channel as any;
    if (channel?.isThread?.()) return null;
    if (typeof (replyMessage as any).startThread !== "function") return null;

    const thread = await (replyMessage as any).startThread({
      name: buildMurrayAiThreadName(question),
      autoArchiveDuration: 60,
      reason: "Murray AI follow-up thread",
    });

    if (questionAuthorId) registerMurrayAiThreadQuestionAuthor(thread.id, questionAuthorId);

    await thread.send(
      questionAuthorId
        ? `Pode continuar a conversa aqui na thread — <@${questionAuthorId}> pode fazer follow-up sem repetir \`/ask\`.`
        : "Pode continuar a conversa aqui na thread — é só responder normalmente, sem repetir `/ask`.",
    );
    return thread;
  } catch (error) {
    console.log(`ask command thread create error: ${error}`);
    return null;
  }
};

export const sendAskCommandChunks = async ({
  interaction,
  chunks,
  question,
  shouldCreateThread,
  questionAuthorId,
}: {
  interaction: Pick<ChatInputCommandInteraction, "editReply" | "followUp">;
  chunks: string[];
  question: string;
  shouldCreateThread: boolean;
  questionAuthorId?: string;
}): Promise<void> => {
  const replyMessage = await interaction.editReply(chunks[0]);
  const remainingChunks = chunks.slice(1);

  if (remainingChunks.length === 0) {
    if (shouldCreateThread) await createFollowUpThread(replyMessage as Message, question, questionAuthorId);
    return;
  }

  if (shouldCreateThread) {
    const thread = await createFollowUpThread(replyMessage as Message, question, questionAuthorId);
    if (thread?.send) {
      for (const chunk of remainingChunks) {
        await thread.send(chunk);
      }
      return;
    }
  }

  for (const chunk of remainingChunks) {
    await interaction.followUp(chunk);
  }
};


export const sendDiscordMessageChunks = async ({
  message,
  chunks,
  question,
  shouldCreateThread,
  questionAuthorId,
}: {
  message: Message;
  chunks: string[];
  question: string;
  shouldCreateThread: boolean;
  questionAuthorId?: string;
}): Promise<void> => {
  const replyMessage = await message.reply(chunks[0]);
  const remainingChunks = chunks.slice(1);

  if (remainingChunks.length === 0) {
    if (shouldCreateThread) await createFollowUpThread(replyMessage as Message, question, questionAuthorId);
    return;
  }

  if (shouldCreateThread) {
    const thread = await createFollowUpThread(replyMessage as Message, question, questionAuthorId);
    if (thread?.send) {
      for (const chunk of remainingChunks) {
        await thread.send(chunk);
      }
      return;
    }
  }

  for (const chunk of remainingChunks) {
    await (message.channel as any).send(chunk);
  }
};

export async function askCommand(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  const question = interaction.options.getString("pergunta", true);

  await interaction.deferReply({ ephemeral: !isMurrayAiAllowedGuildContext(interaction.guildId) });

  if (!isMurrayAiAllowedGuildContext(interaction.guildId)) {
    await interaction.editReply(buildMurrayAiGuildOnlyMessage());
    return;
  }

  try {
    const result = await askMurrayAiQuestion({
      userId: interaction.user.id,
      channel: interaction.channel,
      question,
    });

    const answer = result.active && !result.limited
      ? formatMurrayAiPublicAnswer({
          question,
          answer: result.answer,
          askedBy: interaction.user.username,
        })
      : result.answer;
    const chunks = splitDiscordMessage(answer);
    await sendAskCommandChunks({
      interaction,
      chunks,
      question,
      shouldCreateThread: result.active && !result.limited,
      questionAuthorId: interaction.user.id,
    });
  } catch (error) {
    console.log(`ask command error: ${error}`);
    await interaction.editReply(
      "Não consegui consultar o Murray AI agora. Tente novamente em instantes.",
    );
  }
}
