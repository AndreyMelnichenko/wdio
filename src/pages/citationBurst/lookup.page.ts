import { URL } from "url";
import { CitationBurst } from "./citationBurst.page";

class CampaignsLookup extends CitationBurst {
  public getURL(): URL {
    return new URL(`${this.pageUrl.href}/campaigns/${this.pathId}/lookup`);
  }
  public elementLocator: string = "//*[text()='Add Campaign (Step 2)']";
}

export { CampaignsLookup };
