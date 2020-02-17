declare class MailListener {
  constructor(options?: any);
  username: string;
  password: string;
  host: string;
  port: number;
  tls: boolean;
  connTimeout: number;
  authTimeout: number;
  debug;
  tlsOptions: { rejectUnauthorized: boolean };
  mailbox: string;
  searchFilter: any[];
  fetchUnreadOnStart: boolean;
  mailParserOptions: { streamAttachments: boolean };
  attachments: boolean;
  attachmentOptions: { directory: string };
  markSeen: any;
  imap: any;

  addListener(type: any, listener: any): any;
  emit(type: any, args: any): any;
  eventNames(): any;
  getMaxListeners(): any;
  listenerCount(type: any): any;
  listeners(type: any): any;
  off(type: any, listener: any): any;
  on(type: any, listener: any): any;
  once(type: any, listener: any): any;
  prependListener(type: any, listener: any): any;
  prependOnceListener(type: any, listener: any): any;
  rawListeners(type: any): any;
  removeAllListeners(type: any, ...args: any[]): any;
  removeListener(type: any, listener: any): any;
  setMaxListeners(n: any): any;
  start(): void;
  stop(): void;
}

export = MailListener;

// export interface Mail {
//   date: string;
//   eml: string;
//   from: Array<{ address: string; name: string }>;
//   headers: any;
// }

// export { MailListener2 };
// export = Mail;
