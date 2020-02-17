import { URL } from "url";
import { Leads } from "./leads.page";

class AgencyDirectory extends Leads {
  public pageUrl: URL = new URL(`${this.pageUrl.href}/agency-directory`);
  public elementLocator: string = "//a[text()='Manage Your Company Listing']";
}

export { AgencyDirectory };
