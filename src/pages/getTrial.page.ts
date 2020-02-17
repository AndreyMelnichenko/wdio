import { URL } from "url";
import { BasePage } from "./base.page";

class GetTrial extends BasePage {
  public pageUrl = new URL(`${browser.options.baseUrl}get-trial`);
  public elementLocator = "#comparison-table";
}

export { GetTrial };
