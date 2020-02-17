import { URL } from "url";
import { CitationBurst } from "./citationBurst.page";

class CampaignsNotify extends CitationBurst {
  public pageUrl: URL = new URL(`${this.pageUrl.href}/campaigns/`);
  public elementLocator: string = "//input[@value='Notify Me']";
}

export { CampaignsNotify };
