import { URL } from "url";
import { BasePage } from "../base.page";

abstract class Account extends BasePage {
  public pageUrl: URL = new URL(`${browser.options.baseUrl}account-details`);
  public elementLocator: string = "//h1[text()='Account']";
}

export { Account };
