import { URL } from 'url';
import { BasePage } from '../base.page';

class PurchaseConfirm extends BasePage {
  public pageUrl = new URL(`${browser.options.baseUrl}purchase/confirm`);
  public elementLocator =
    "//*[normalize-space(text())='Your payment was successful']";
}

export { PurchaseConfirm };
