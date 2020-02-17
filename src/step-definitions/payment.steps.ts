import { expect } from 'chai';
import { Given, TableDefinition, Then, When } from 'cucumber';
import * as diff from 'fast-array-diff';
import { BrainTreeClient } from '../api/payments/braintree.api';
import { PayPalSandBox } from '../pages/3rd-parties/paypal.sandbox.page';
import { BasePage } from '../pages/base.page';
import { PaymentConfirmation } from '../pages/paymentConfirmation.page';
import { Helper } from '../utils/helper';

const page: PaymentConfirmation = new PaymentConfirmation();

When(/^confirm PayPal (payment|subscription) with:$/, function (
  type: string,
  data: TableDefinition
) {
  const payment = new PayPalSandBox();
  switch (type) {
    case 'payment':
      const res = payment.loginforPayment(data.hashes()[0]).makePayment();
      expect(res.receiptNumber.length).to.be.greaterThan(0);
      break;
    case 'subscription':
      payment.loginforBuySubscription(data.hashes()[0]).buySubscription();
      break;
    default:
      break;
  }
});

Given(
  /^Invoice for current month should contains list of transactions as "(.*)"$/,
  function (varName: string) {
    const invoiceData: any[] = page.getInvoiceData();
    this.keepValue(varName, invoiceData);
  }
);

Given(
  /^Braintree API should return transactions list as "(.*)"$/,
  async function (varName: string) {
    const api = new BrainTreeClient();
    const cid = this.getUser().cid;
    const data = await api.getTransactions(cid);
    this.keepValue(varName, data);
  }
);

When(/^keep payment data as "(.*)"$/, function (varName: string) {
  const paymentDetails = page.getPriceDetails();
  this.keepValue(varName, paymentDetails);
});

When(/^user submit card payment$/, function () {
  page.payByCard();
});

Then(
  /^invoice for current month should contains transaction with (.*) of "(.*)"$/,
  function (varName: string) {
    const er = Helper.getWorldValue(varName, this);
    BasePage.openPath(`/packages/invoice/${Helper.getCurrentMonthFormated()}`);
    const data: any[] = BasePage.getTable({
      name:
        `Payment Receipt - ${Helper.getCurrentMonthFormated('MMM YYYY')}`
    }
    );
    data.filter(x => x.Amount === er);
  }
);

Then(
  /^Braintree API should return new success payment transaction with id "(.*)"$/,
  async function (varName: string) {
    const er = Helper.getWorldValue(varName, this);
    const api = new BrainTreeClient();
    const data = await api.getTransactions(this.getUser().email);
    expect(data.map(i => i.id)).to.contains(er);
  }
);

Then(
  /^Invoice for current month (should|should not) contains new "(.*)" then '(.*)'(?: as "(.*)")?$/,
  function (
    ifContains: string,
    fieldName: string,
    existVar: string,
    varName: string
  ) {
    const check = !ifContains.endsWith('not');
    const existList = Helper.getWorldValue(existVar, this);
    const invoiceData: any[] = page.getInvoiceData();
    const result: diff.DiffData<number> = diff.diff(
      existList,
      invoiceData,
      // comparator
      (ia, ib): boolean => (ia[fieldName] = ib[fieldName])
    );
    expect(
      result.added.length,
      `invoice inconsistent transactions list:\n${result}`
    ).eqls(+check);
    // if exist write to world
    if (varName) this.keepValue(varName, result.added[0][fieldName]);
  }
);
