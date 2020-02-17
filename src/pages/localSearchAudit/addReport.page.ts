import { URL } from "url";
import { LocalSearchAudit } from "./localSearchAudit.page";

class AddLSAReport extends LocalSearchAudit {
  public pageUrl: URL = new URL(`${this.pageUrl}/reports/add`);
  public elementLocator: string = "//input[@value='Run Report']";
}

export { AddLSAReport };
