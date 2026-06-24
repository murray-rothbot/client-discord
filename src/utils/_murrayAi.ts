export interface MurrayAiPlan {
  monthlySats: number;
  maxBrl: number;
  dailyAskLimit: number;
  contextMessageLimit: number;
  maxAnswerChars: number;
}

export interface MurrayAiAristocrataBetaConfig {
  enabled: boolean;
  roleName: string;
  dailyAskLimit: number;
}

export interface MurrayAiContextMessage {
  authorName: string;
  content: string;
  createdAt: Date;
  bot?: boolean;
}

export const getMurrayAiPlan = (): MurrayAiPlan => ({
  monthlySats: Number(process.env.MURRAY_AI_MONTHLY_SATS || 14900),
  maxBrl: Number(process.env.MURRAY_AI_MAX_BRL || 49),
  dailyAskLimit: Number(process.env.MURRAY_AI_DAILY_ASK_LIMIT || 5),
  contextMessageLimit: Number(process.env.MURRAY_AI_CONTEXT_MESSAGE_LIMIT || 60),
  maxAnswerChars: Number(process.env.MURRAY_AI_MAX_ANSWER_CHARS || 6000),
});

export const canUseMurrayAiToday = (
  usedToday: number,
  plan: MurrayAiPlan = getMurrayAiPlan(),
): boolean => usedToday < plan.dailyAskLimit;

const parseBooleanFlag = (value: string | undefined, defaultValue: boolean): boolean => {
  if (value === undefined) return defaultValue;
  return !["0", "false", "no", "off", "disabled"].includes(value.trim().toLowerCase());
};

export const getMurrayAiAristocrataBetaConfig = (): MurrayAiAristocrataBetaConfig => ({
  enabled: parseBooleanFlag(process.env.MURRAY_AI_ARISTOCRATA_BETA_ENABLED, true),
  roleName: process.env.MURRAY_AI_ARISTOCRATA_BETA_ROLE_NAME || "Aristocrata",
  dailyAskLimit: Number(process.env.MURRAY_AI_ARISTOCRATA_BETA_DAILY_LIMIT || 1),
});

export const isMurrayAiAristocrataBetaEligible = (
  roleNames: string[] = [],
  config: MurrayAiAristocrataBetaConfig = getMurrayAiAristocrataBetaConfig(),
): boolean =>
  config.enabled && roleNames.some((roleName) => roleName.toLowerCase() === config.roleName.toLowerCase());

export const buildMurrayAiAristocrataBetaCta = (
  config: MurrayAiAristocrataBetaConfig = getMurrayAiAristocrataBetaConfig(),
): string =>
  [
    "🎩🧠 **Promo beta test do Murray AI para Aristocratas!**",
    "",
    `Durante essa promoção, Aristocratas têm **${config.dailyAskLimit} pergunta grátis por dia** no \`/ask\` para testar a feature antes de assinar Oligarca + Murray AI.`,
    "É um teasing do beta: usa, testa, quebra, manda feedback e vê se curte 😄",
    "",
    "Quer uso completo? Use `/oligarcas meses:1` para liberar o plano com mais perguntas por dia.",
  ].join("\n");


export const sanitizeMurrayAiAnswer = (value: string): string =>
  value.replace(/@everyone/g, "@\u200beveryone").replace(/@here/g, "@\u200bhere");

const sanitizeContextContent = (value: string): string =>
  sanitizeMurrayAiAnswer(value)
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 800);

export const buildMurrayAiContext = (
  messages: MurrayAiContextMessage[],
  plan: MurrayAiPlan = getMurrayAiPlan(),
): string[] =>
  messages
    .filter((message) => !message.bot)
    .filter((message) => sanitizeContextContent(message.content).length > 0)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .slice(-plan.contextMessageLimit)
    .map((message) => {
      const time = message.createdAt.toISOString().slice(11, 16);
      return `[${time}] ${message.authorName}: ${sanitizeContextContent(message.content)}`;
    });

export const buildMurrayAiPrompt = (question: string, contextLines: string[]): string => `Você é Murray AI, um especialista técnico em Bitcoin dentro do The Bitcoin Discord, um servidor de bitcoiners.
Seu padrão de qualidade é alto: responda como alguém que entende Bitcoin profundamente, incluindo consenso, mineração, mempool, Script, Lightning, sidechains, Drivechain/BIP300/BIP301, covenants, trade-offs, riscos e história técnica.

Regras de resposta:
- Responda em português, salvo se o usuário perguntar em outro idioma.
- Use o contexto do Discord quando ele existir, principalmente para explicar o que as pessoas na conversa disseram.
- Se a pergunta for geral (ex.: "o que são drivechains?"), responda usando seu conhecimento geral técnico de Bitcoin mesmo que o contexto esteja vazio.
- Não peça permissão para dar uma explicação geral; dê a melhor resposta diretamente.
- Se precisar de informação atual, web, GitHub, preço, status de PR/BIP/repositório ou código específico e essa informação não estiver nas fontes recebidas, diga claramente que precisa de busca externa/configuração de ferramenta para confirmar o estado atual. Ainda assim explique o conceito geral quando souber.
- Para Drivechain, fale de BIP300/BIP301, sidechains mineradas por blind merged mining, withdrawals/escrow, trade-offs e controvérsias de segurança/mineração quando relevante.
- Diferencie fatos, opiniões e controvérsias. Não invente consenso da thread se ele não existir.
- Não use @everyone nem @here.
- Seja direto, útil e técnico; evite respostas covardes tipo "não tenho contexto" para perguntas básicas de Bitcoin.

Pergunta do usuário:
${question}

Contexto recente do Discord (pode estar vazio):
${contextLines.length ? contextLines.join("\n") : "(sem contexto recente relevante)"}`;


export const buildMurrayAiFallbackAnswer = (
  question: string,
  contextLines: string[],
  plan: MurrayAiPlan = getMurrayAiPlan(),
): string => {
  const quotedContext = contextLines.slice(-8).join("\n");
  const answer = [
    "🧠 **Murray AI — contexto da conversa**",
    "",
    `**Pergunta:** ${sanitizeMurrayAiAnswer(question)}`,
    "",
    contextLines.length > 0
      ? "O provider LLM não respondeu agora; enquanto isso, estes são os trechos mais recentes/relevantes do contexto:"
      : "O provider LLM não respondeu agora e não encontrei mensagens úteis nesse canal/thread. Tente novamente em instantes.",
    "",
    quotedContext ? `**Contexto analisado:**\n${quotedContext}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return sanitizeMurrayAiAnswer(answer).slice(0, plan.maxAnswerChars);
};

const MURRAY_AI_THREAD_PREFIX = "🧠 Murray AI · ";
const murrayAiThreadQuestionAuthorByThreadId = new Map<string, string>();

export const registerMurrayAiThreadQuestionAuthor = (threadId: string, userId: string): void => {
  murrayAiThreadQuestionAuthorByThreadId.set(threadId, userId);
};

export const getMurrayAiThreadQuestionAuthor = (threadId: string): string | undefined =>
  murrayAiThreadQuestionAuthorByThreadId.get(threadId);



export const isMurrayAiAllowedGuildContext = (
  guildId?: string | null,
  configuredGuildId: string | undefined = process.env.GUILD_ID,
): boolean => {
  if (!guildId) return false;
  if (!configuredGuildId) return true;
  return guildId === configuredGuildId;
};

export const buildMurrayAiGuildOnlyMessage = (): string =>
  "O Murray AI só funciona em canais/threads do servidor Bitcoin Discord, não em DM.";

export const buildMurrayAiThreadName = (question: string): string => {
  const cleanedQuestion = sanitizeMurrayAiAnswer(question)
    .replace(/[`*_~|>\n\r]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const suffix = cleanedQuestion || "continuação";
  return `${MURRAY_AI_THREAD_PREFIX}${suffix}`.slice(0, 90);
};

export const isMurrayAiThreadName = (name?: string | null): boolean =>
  Boolean(name && (name.startsWith(MURRAY_AI_THREAD_PREFIX) || name.startsWith("Murray AI · ")));

const looksLikeMurrayAiFollowUp = (content: string): boolean => {
  const normalized = content.trim().toLowerCase();
  if (!normalized) return false;
  if (normalized.includes("?")) return true;
  return /^(e |mas |então |explica|explique|detalha|detalhe|compara|compare|resume|resuma|calcula|calcule|qual|quais|como|por que|porque|pq|o que|oq|quem|quando|onde|quanto|se )/i.test(normalized);
};

export const shouldAnswerMurrayAiThreadMessage = ({
  isBotAuthor,
  isMurrayAiThread,
  mentionsBot,
  repliesToBot,
  isQuestionAuthor = false,
  mentionsOtherUsers = false,
  repliesToOtherUser = false,
  content,
}: {
  isBotAuthor: boolean;
  isMurrayAiThread: boolean;
  mentionsBot: boolean;
  repliesToBot: boolean;
  isQuestionAuthor?: boolean;
  mentionsOtherUsers?: boolean;
  repliesToOtherUser?: boolean;
  content: string;
}): boolean => {
  if (isBotAuthor) return false;
  if (!isMurrayAiThread) return false;
  if (!content.trim()) return false;
  if (mentionsBot || repliesToBot) return true;
  if (!isQuestionAuthor) return false;
  if (mentionsOtherUsers || repliesToOtherUser) return false;
  return looksLikeMurrayAiFollowUp(content);
};



export const shouldAnswerMurrayAiMentionMessage = ({
  isBotAuthor,
  mentionsBot,
  content,
}: {
  isBotAuthor: boolean;
  mentionsBot: boolean;
  content: string;
}): boolean => {
  if (isBotAuthor) return false;
  if (!mentionsBot) return false;
  return content.trim().length > 0;
};

export const stripMurrayAiBotMention = (content: string, botUserId: string): string =>
  content
    .replace(new RegExp(`<@!?${botUserId}>`, "g"), "")
    .replace(/\s+/g, " ")
    .trim();

export const splitDiscordMessage = (message: string, maxLength = 1900): string[] => {
  const normalized = sanitizeMurrayAiAnswer(message).trim();
  if (!normalized) return [""];
  if (normalized.length <= maxLength) return [normalized];

  const chunks: string[] = [];
  let remaining = normalized;

  while (remaining.length > maxLength) {
    const window = remaining.slice(0, maxLength);
    const paragraphBreak = window.lastIndexOf("\n\n");
    const lineBreak = window.lastIndexOf("\n");
    const sentenceBreak = Math.max(
      window.lastIndexOf(". "),
      window.lastIndexOf("! "),
      window.lastIndexOf("? "),
    );
    const spaceBreak = window.lastIndexOf(" ");
    const splitAt =
      paragraphBreak > maxLength * 0.45
        ? paragraphBreak + 2
        : lineBreak > maxLength * 0.45
          ? lineBreak + 1
          : sentenceBreak > maxLength * 0.45
            ? sentenceBreak + 2
            : spaceBreak > maxLength * 0.45
              ? spaceBreak + 1
              : maxLength;

    chunks.push(remaining.slice(0, splitAt).trim());
    remaining = remaining.slice(splitAt).trim();
  }

  if (remaining) chunks.push(remaining);
  return chunks;
};


export const formatMurrayAiPublicAnswer = ({
  question,
  answer,
  askedBy,
}: {
  question: string;
  answer: string;
  askedBy?: string;
}): string => {
  const asker = askedBy ? ` de ${askedBy}` : "";
  return sanitizeMurrayAiAnswer([
    `🧠 **Pergunta${asker}:** ${question}`,
    "",
    answer,
  ].join("\n"));
};
