import { URL } from "url";
import { BasePage } from "../base.page";

class CitationReportView extends BasePage {
  public pageUrl: URL = new URL(`${browser.options.baseUrl}ct/reports/view`);
  public elementLocator = "//*[text()='View Report:']";
}

export { CitationReportView };
