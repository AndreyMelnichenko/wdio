import { URL } from 'url';
import { BasePage } from '../base.page';

abstract class BillingDetails extends BasePage {
  public pageUrl: URL = new URL(`${browser.options.baseUrl}packages`);
  public elementLocator: string = "//h1[text()='Billing Details']";
}

export { BillingDetails };
