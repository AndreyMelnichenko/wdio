import { URL } from "url";
import { BasePage } from "../base.page";

class Leads extends BasePage {
  public pageUrl: URL = new URL(`${browser.options.baseUrl}lead-gen`);
  public elementLocator: string = "//h1[text()='Agency Leads']";
}

export { Leads };
