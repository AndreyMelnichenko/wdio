import * as braintree from 'braintree';
import * as fs from 'fs';
import PromisePiping, { PromiseReadablePiping } from 'promise-piping';
import { Stream } from 'stream';
import * as util from 'util';
import { BTransaction } from '../../models/braintee/Transaction';

class BrainTreeClient {
  public gateway: any;
  public arr: any[] = [];

  constructor() {
    this.gateway = braintree.connect({
      environment: braintree.Environment.Sandbox,
      merchantId: '',
      publicKey: '',
      privateKey: ''
    });
  }

  /**
   * Get transactions list by customer email or customerId (uniq)
   *
   * @param {(number | string)} customerIdOrEmail
   * @returns {Promise<BTransaction[]>}
   * @memberof BrainTreeClient
   */
  public async getTransactions(
    customerIdOrEmail: number | string
  ): Promise<BTransaction[]> {
    const transactions: BTransaction[] = [];

    const filter =
      typeof customerIdOrEmail === 'number'
        ? search => search.customerId().is(`${customerIdOrEmail}`)
        : search => search.customerEmail().is(`${customerIdOrEmail}`);

    const transactionStream = this.gateway.transaction.search(search => {
      filter(search);
    });

    const writableStream = new Stream.Writable({ objectMode: true });
    writableStream._write = async (chunk, enc, next) => {
      await next();
    };

    transactionStream.on('data', async (transaction: BTransaction) => {
      await transactions.push(transaction as BTransaction);
    });

    const piping = new PromisePiping(transactionStream, writableStream);
    await piping.once('end');
    return transactions;
  }
}

export { BrainTreeClient };
