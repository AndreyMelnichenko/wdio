import { URL } from 'url';
import { BasePage } from '../base.page';
import { ReputationManager } from './reputationManager.page';

class AddRMReport extends ReputationManager {
  public pageUrl: URL = new URL(`${this.pageUrl.href}/reports/add`);
  public elementLocator: string = "//*[text()='Add Report']";

  /**
   * Choose direcory checkbox for find listing
   */
  public chooseDirecoryListing(dirName: string, only: boolean = false) {
    if (only) {
      // clear selected
      BasePage.unfocus();
      BasePage.scrollPageDown(2);

      if (BasePage.getCheckboxState('ReviewSourcesHeader-checkbox') !== false) {
        BasePage.clickChBoxIput('ReviewSourcesHeader-checkbox', 1500);
      }
    }
    BasePage.clickOnButton(dirName);
  }
}

export { AddRMReport };
