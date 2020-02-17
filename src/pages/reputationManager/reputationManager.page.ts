import { URL } from "url";
import { BasePage } from "../base.page";

class ReputationManager extends BasePage {
  public pageUrl: URL = new URL(`${browser.options.baseUrl}rm`);
  public elementLocator: string = "//h1[text()='Reputation Manager']";
}

export { ReputationManager };
