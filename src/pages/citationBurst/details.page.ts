import { URL } from 'url';
import { BasePage } from '../base.page';
import { CitationBurst } from './citationBurst.page';

class CampaignsDetails extends CitationBurst {
  public elementLocator: string = "//*[text()='Add Campaign (Step 3)']";

  public fulfillInputs(arg0): CampaignsDetails {
    BasePage.addInputValues(arg0);
    return this;
  }
  public getURL(): URL {
    return new URL(`${this.pageUrl.href}/campaigns/${this.pathId}/details`);
  }
}

export { CampaignsDetails };
