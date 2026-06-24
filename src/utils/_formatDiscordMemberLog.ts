type DiscordUserLike = {
  id?: string | null;
  username?: string | null;
  globalName?: string | null;
  tag?: string | null;
  bot?: boolean | null;
  createdAt?: Date | null;
};

type DiscordGuildMemberLike = {
  id?: string | null;
  displayName?: string | null;
  joinedAt?: Date | null;
  user?: DiscordUserLike | null;
};

type FormatOptions = {
  now?: Date;
};

const unknown = "desconhecido";

const getUserId = (member: DiscordGuildMemberLike): string =>
  member.user?.id ?? member.id ?? unknown;

const formatTimestamp = (date?: Date | null): string => {
  if (!date) return unknown;

  const timestamp = Math.floor(date.getTime() / 1000);
  return `<t:${timestamp}:F> (<t:${timestamp}:R>)`;
};

const formatBoolean = (value?: boolean | null): string => {
  if (value === true) return "sim";
  if (value === false) return "não";
  return unknown;
};

const codeOrUnknown = (value?: string | null): string =>
  value ? `\`${value}\`` : unknown;

const textOrUnknown = (value?: string | null): string => value || unknown;

const formatMemberDetails = (
  member: DiscordGuildMemberLike,
  extraLines: string[] = [],
): string => {
  const user = member.user;
  const userId = getUserId(member);

  return [
    `**Usuário:** <@${userId}>`,
    `**Username:** ${codeOrUnknown(user?.username)}`,
    `**Tag:** ${codeOrUnknown(user?.tag)}`,
    `**Nome global:** ${textOrUnknown(user?.globalName)}`,
    `**Nome no servidor:** ${textOrUnknown(member.displayName)}`,
    `**ID:** ${codeOrUnknown(userId)}`,
    `**Conta criada:** ${formatTimestamp(user?.createdAt)}`,
    `**Entrou no servidor:** ${formatTimestamp(member.joinedAt)}`,
    ...extraLines,
    `**Bot:** ${formatBoolean(user?.bot)}`,
  ].join("\n");
};

export const formatDiscordMemberJoinLog = (
  member: DiscordGuildMemberLike,
  _options: FormatOptions = {},
): string => {
  const userId = getUserId(member);

  return [
    `:inbox_tray: O usuário <@${userId}> entrou no servidor.`,
    formatMemberDetails(member),
  ].join("\n");
};

export const formatDiscordMemberLeaveLog = (
  member: DiscordGuildMemberLike,
  options: FormatOptions = {},
): string => {
  const userId = getUserId(member);
  const now = options.now ?? new Date();

  return [
    `:outbox_tray: O usuário <@${userId}> saiu do servidor ou foi chutado.`,
    formatMemberDetails(member, [
      `**Saiu/foi chutado em:** ${formatTimestamp(now)}`,
    ]),
  ].join("\n");
};

export const formatDiscordMemberVerifiedLog = (
  member: DiscordGuildMemberLike,
  options: FormatOptions = {},
): string => {
  const userId = getUserId(member);
  const now = options.now ?? new Date();

  return [
    `:ok: Usuário <@${userId}> verificado!`,
    formatMemberDetails(member, [`**Verificado em:** ${formatTimestamp(now)}`]),
  ].join("\n");
};

export const formatDiscordCommandLog = (
  commandName: string,
  member: DiscordGuildMemberLike,
  options: FormatOptions = {},
): string => {
  const userId = getUserId(member);
  const now = options.now ?? new Date();

  return [
    `:robot: \`/${commandName}\` command executed by <@${userId}>`,
    formatMemberDetails(member, [`**Executado em:** ${formatTimestamp(now)}`]),
  ].join("\n");
};
