import { URL } from 'url';
import { Helper } from '../utils/helper';
import { BasePage } from './base.page';

class PaymentConfirmation extends BasePage {
  public pageUrl = new URL(`${browser.options.baseUrl}payments/form/`);
  public elementLocator = "//*[normalize-space(text())='Payment Confirmation']";

  public payCard =
    "//*[normalize-space(text())='Payment Confirmation']/following::form//button[@type='submit']";
  private orUsePayPal = "//*[normalize-space(text())='PayPal']";
  private cardNumber: string = '#CardForm-cardNumber';
  private nameOnCard: string = '#CardForm-nameOnCard';
  private streetAddress: string = '#CardForm-streetAddress';
  private buyingName: string = '.buyingName';
  private buyingCaption: string = '.buyingCaption';
  private price: string = '.priceValue';
  private vat: string = '.vatValue';
  private total: string = '.totalValue';
  private securityCode: string = '#CardForm-security_code';
  private postalCode: string = '#CardForm-postalCode';

  private payments = {
    price: '[class$=priceValue]',
    vat: '[class$=vatValue]',
    total: '[class$=priceValue]'
  };

  public addCardNumber(cardNumber: string): void {
    $(this.cardNumber).addValue(cardNumber);
  }

  public addAddress(streetAddress: string): void {
    $(this.streetAddress).addValue(streetAddress);
  }

  public addNameOnCard(name: string): void {
    $(this.nameOnCard).addValue(name);
  }

  public getBuyingCaption(): string {
    return $(this.buyingCaption).getText();
  }

  public getBuyingName(): string {
    return $(this.buyingName).getText();
  }

  public getPriceSummary(): { price: number; vat: number; total: number } {
    return {
      price: Number.parseFloat($(this.price).getText()),
      vat: Number.parseFloat($(this.vat).getText()),
      total: Number.parseFloat($(this.total).getText())
    };
  }
  public payByCard(): void {
    browser.pause(350);
    browser.scroll(100, 500);
    browser.pause(500);
    browser.scroll(300, 700);
    $(this.payCard).click();
  }

  public getPriceDetails(): { Price: number; VAT: number; Total: number } {
    return {
      Price: Number.parseFloat($(this.payments.price).getText()),
      VAT: Number.parseFloat($(this.payments.vat).getText()),
      Total: Number.parseFloat($(this.payments.total).getText())
    };
  }

  /**
   * Get data from invoice table 'Payment Receipt' as object[]
   *
   * @param {string} dateString -- should be formated YYY-MM
   * @returns {any[]}
   * @memberof PaymentConfirmation
   */
  public getInvoiceData(
    dateString: string = Helper.getCurrentMonthFormated()
  ): any[] {
    if (dateString.match(/^(\d{4})-(\d{2})$/).length === 0) {
      throw Error('Incorrect date format, expected YYYY-MM');
    }
    BasePage.openPath(`/packages/invoice/${dateString}`);
    return BasePage.getTable({ name: 'Payment Receipt' });
  }
}

export { PaymentConfirmation };
