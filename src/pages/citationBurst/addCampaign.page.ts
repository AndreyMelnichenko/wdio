import { URL } from 'url';
import { BasePage } from '../base.page';
import { CitationBurst } from './citationBurst.page';

class AddCampaign extends CitationBurst {
  public pageUrl: URL = new URL(`${this.pageUrl}/campaigns/create`);
  public elementLocator: string = "//h1[text()='Add Campaign']";
  private campaignNotes:string = "[name='campaignNotes']";

  public fulfillInputs(arg0): AddCampaign {
    BasePage.addInputValues(arg0);
    return this;
  }

  public setCapaignNotes(testToNotes:string):AddCampaign{
    $(this.campaignNotes).waitForDisplayed(5000);
    $(this.campaignNotes).setValue(testToNotes);
    return this;
  }
}

export { AddCampaign };
