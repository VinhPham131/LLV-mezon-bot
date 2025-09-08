/* eslint-disable @typescript-eslint/no-empty-object-type */
export const BOT_ID = process.env.BOT_ID;

export const EMAIL_DOMAIN = 'ncc.asia';

export const MEZON_IMAGE_URL =
  'https://cdn.mezon.vn/1837043892743049216/1840654271217930240/1827994776956309500/857_0246x0w.webp';

export const MEZON_EMBED_FOOTER = {
  text: 'Powered by Mezon',
  icon_url: MEZON_IMAGE_URL,
};

export enum EMessageMode {
  CHANNEL_MESSAGE = 2,
  DM_MESSAGE = 4,
  THREAD_MESSAGE = 6,
}

export enum ErrorSocketType {
  TIME_OUT = 'The socket timed out while waiting for a response.',
  NOT_ESTABLISHED = 'Socket connection has not been established yet.',
}

export enum DynamicCommandType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
}

export interface EmbedProps {
  color?: string;
  title?: string;
  url?: string;
  author?: {
    name: string;
    icon_url?: string;
    url?: string;
  };
  description?: string;
  thumbnail?: { url: string };
  fields?: Array<{
    name: string;
    value: string;
    inline?: boolean;
    options?: any[];
    inputs?: {};
  }>;
  image?: { url: string; width: string; height: string };
  timestamp?: string;
  footer?: { text: string; icon_url?: string };
}

export enum EmbeddedButtonType {
  CONFIRM = 'CONFIRM',
  CANCEL = 'CANCEL',
  VOTE = 'VOTE',
  FINISH = 'FINISH',
  ORDER = 'ORDER',
  REPORT = 'REPORT',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
}

export enum UserType {
  Intern,
  Staff,
}

export enum TransferType {
  REGULAR = 'regular',
  API = 'api',
}
