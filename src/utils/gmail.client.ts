import MailListener from 'mail-listener2';

/**
 * Connect go gmail with IMAP
 *
 *
 * Example:
 * @example
 * const test = new GmailClient(`myEmail@gmail.com`, `password`);
 * async () => {
 *   try {
 *     const res: GmailClient = await test.connect();
 *     // filter mails by subject, timeout for fetch emais
 *     const mails = await res.fetchEmails('Good', 15000);
 *     // return list of matched emails
 *     console.log(mails);
 *   } catch (error) {
 *     // reject Promise if no emails in list
 *     console.warn('ERROR:', error);
 *   }
 * })();
 *  </code>
 * @class GmailClient
 * @constructor
 */
class GmailClient {
  private username: string;
  private password: string;
  private host: string = 'imap.gmail.com';
  private port: number = 993; // imap port
  private tls: boolean = true;
  private connTimeout: number = 10000; // Default by node-imap
  private authTimeout: number = 5000; // Default by node-imap,
  // tslint:disable-next-line:no-console
  private debug = console.log; // Or your custom function with only one incoming argument. Default: null
  private tlsOptions = { rejectUnauthorized: false };
  private mailbox: string = 'INBOX'; // mailbox to monitor
  private searchFilter: any[] = ['UNSEEN',"FLAGGED"]; // the search filter being used after an IDLE notification has been retrieved
  private markSeen: boolean = true; // all fetched email willbe marked as seen and not fetched next time
  private fetchUnreadOnStart: boolean = true; // use it only if you want to get all unread email on lib start. Default is `false`,
  private mailParserOptions = { streamAttachments: false }; // options to be passed to mailParser lib.
  private attachments: boolean = false; // download attachments as they are encountered to the project directory
  private attachmentOptions: { directory: 'attachments/' }; // specify a download directory for attachments
  //
  private _instance: MailListener;
  private _mails: any[];

  constructor(username, password, filter?) {
    if (username) this.username = username;
    if (password) this.password = password;
    if (filter) this.searchFilter = filter;
    this._mails = [];
    this._instance = new MailListener(this);
  }

  /**
   * Connect to IMAP
   *
   * @returns {Promise<GmailClient>}
   * @memberof GmailClient
   */
  public async connect(): Promise<GmailClient> {
    return new Promise<GmailClient>((reslove, reject) => {
      this._instance.start();

      this._instance.on('server:connected', () => {
        // tslint:disable-next-line:no-console
        console.info('imapConnected');
        reslove(this);
      });

      this._instance.on('server:disconnected', () => {
        // tslint:disable-next-line:no-console
        console.info('imapDisconnected');
      });

      this._instance.on('error', err => {
        // tslint:disable-next-line:no-console
        console.warn('Error in mail-listener', err);
        reject(new Error(err));
      });

      this._instance.on('attachment', attachment => {
        // tslint:disable-next-line:no-console
        console.info(attachment.path);
      });
    });
  }

  /**
   * Shoot-down listener instance
   *
   * @returns {Promise<void>}
   * @memberof GmailClient
   */
  public shootDown(): Promise<void> {
    return new Promise((res, rej) => {
      try {
        res(this._instance.stop());
      } catch (error) {
        rej(new Error('Stop failed'));
      }
    });
  }

  /**
   * Attach listener to IMAP
   * listent event 'mail'
   *
   * @param {string} [subjFilter] do filter by subject
   * @param {number} [waitMs=6000] shotdown after ms
   * @returns {Promise<any[]>}
   * @memberof GmailClient
   */
  public async fetchEmails(
    subjFilter: string,
    waitMs: number = 6000
  ): Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
      console.log(browser.getTitle());
      // shotDown if timeout
      setTimeout(() => {
        this.shootDown();
        resolve(this._mails[0]);
      }, waitMs);
      console.log(browser.getTitle());
      this._instance.on('mail', (mail, seqno, attributes) => {
        // do something with mail object including attachments
        // tslint:disable-next-line:no-console
        console.info('emailParsed', seqno);
        console.log(browser.getTitle());
        // filter by subject
        if (mail.subject.includes(subjFilter)) {
          // tslint:disable-next-line:no-console
          console.info(`Filtered email found: ${mail.subject}`);
          this._mails.push(mail);

        }
      });
    });
  }
}

interface IGmailFilter {
  googleEmail?: string;
  googlePassword?: string;
  title?: string;
  waitTimeSec?: number;
}

export { GmailClient, IGmailFilter };
