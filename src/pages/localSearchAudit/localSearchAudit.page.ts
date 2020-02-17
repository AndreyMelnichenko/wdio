import { URL } from "url";
import { BasePage } from "../base.page";

class LocalSearchAudit extends BasePage {
  public pageUrl: URL = new URL(`${browser.options.baseUrl}lscu`);
  public elementLocator: string = "//h1[text()='Local Search Audit']";
}

export { LocalSearchAudit };
