import { URL } from 'url';
import { ParsedCssProperty } from 'webdriverio';
import { BasePage } from '../base.page';

abstract class PlansSelect extends BasePage {
  public pageUrl: URL = new URL(`${browser.options.baseUrl}plans/select`);
  public elementLocator: string =
    "//h1[text()='Pick a plan that suits your business!']";
  private billedToogle: string = '#trial-splash-price-toggle';

  /**
   * switchToggle
   * 'Monthly' || 'Annualy' period allowed
   */
  public switchToggle(billPeriod: string = 'Monthly' || 'Annualy') {
    const currentChoise: ParsedCssProperty = $(
      `//*[@class[contains(., 'billed-label')]  and text() = 'Billed ${billPeriod}']`
    ).getCssProperty('color').parsed;
    if (currentChoise.hex === '#000') {
      //
    } else $(this.billedToogle).click();
  }
}

export { PlansSelect };
