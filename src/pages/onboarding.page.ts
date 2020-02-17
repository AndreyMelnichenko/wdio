import { URL } from 'url';
import { IUser } from '../models/User';
import { BasePage } from './base.page';

class Onboarding extends BasePage {
  public pageUrl = new URL(`${browser.options.baseUrl}onboarding`);
  public elementLocator = '[data-hook="stepContent"]';
  public spinner = '[data-hook="spinner"]';
  private businessTypeList: string =
    '//input[@data-hook="businessTypeInput"]/../..';
  private currentStep: string = "li[data-hook-active-step='true']>span";
  private nextButton: string = "button[data-hook = 'nextStepButton']";
  private shareEmail: string = "input[data-hook='emailInput']";
  private shareFirstName: string = 'input[data-hook="firstNameInput"]';
  private shareLastName: string = 'input[data-hook="lastNameInput"]';
  private customizeWlProfile: string = '[data-hook="chooseColorSchemeInput"]';
  private findYourBusinessField: string =
    'input[data-hook="findYourBusinessField"]';
  private locationName: string = 'div[data-hook="locationName"]';
  private locationAddress: string = 'div[data-hook="locationAddress"]';
  private locationItem: string = 'div[data-hook="locationItem"]';
  private connectToFacebook: string = "//*[text()='Connect Facebook']";

  /**
   * Find locationbase on user input
   * For step 'Import your locations'
   *
   * @param {IUser} user
   * @returns {Array<{ locationName: string; locationAddress: string }>}
   * @memberof Onboarding
   */
  public findLocation(
    user: IUser
  ): Array<{ locationName: string; locationAddress: string }> {
    const inpLoc = $(this.findYourBusinessField);
    inpLoc.waitForExist(5000);
    inpLoc.addValue(user.locationName);
    inpLoc.waitForValue(5000);
    inpLoc.addValue(' ');
    user.locationAddress.split(' ').forEach(addr => {
      browser.pause(300);
      inpLoc.addValue(` ${addr}`);
    });
    $(this.locationItem).waitForDisplayed(browser.options.waitforTimeout * 10);
    browser.pause(1000);
    return $$(this.locationItem).map(x => {
      return {
        locationName: x.$(this.locationName).getText(),
        locationAddress: x.$(this.locationAddress).getText()
      };
    });
  }

  /**
   * Choose color theme for WL account
   *
   * @param {number} i theme index
   * @returns {Onboarding}
   * @memberof Onboarding
   */
  public chooseColorScheme(i: number): Onboarding {
    const list = $$(this.customizeWlProfile);
    list.find((x, idx) => idx === i && x.isClickable()).click();
    return this;
  }

  /**
   * Choose existing GMB location group by index
   * For step 'Import your locations'
   *
   * @param {number} i location group index
   * @returns {Onboarding}
   * @memberof Onboarding
   */
  public setLocationFromList(i: number): Onboarding {
    $(`#location-input-${i}`).click();
    return this;
  }

  /**
   * Choose existing GMB location group by index
   * For step 'Import your locations'
   *
   * @param {number} i location group index
   * @returns {Onboarding}
   * @memberof Onboarding
   */
  public setLocationFromItemsList(i: number): Onboarding {
    try {
      $$(this.locationItem)[i].click();
    } catch (error) {
      // tslint:disable-next-line:no-console
      console.error(`Could not click on item ${i}`, error);
    }
    $(this.locationItem).waitForDisplayed(browser.options.waitforTimeout, true);
    return this;
  }

  /**
   * Choose existing GMB location by name
   * For step 'Import your locations'
   *
   * @param {string} name
   * @returns {Onboarding}
   * @memberof Onboarding
   */
  public setLocationForName(name: string): Onboarding {
    $(`//*[normalize-space(text())='${name}']//../..//input`).click();
    return this;
  }

  /**
   * Choose GMB account from list
   * For step 'Import your locations'
   *
   * @param {string} name
   * @returns {Onboarding}
   * @memberof Onboarding
   */
  public selectGMBAccount(name: string): Onboarding {
    $(
      `//input//following::*[normalize-space(text())='${name}']`
    ).click();
    return this;
  }

  /**
   * Fullfil share invite form
   *
   * @param {IUser} user
   * @returns {Onboarding}
   * @memberof Onboarding
   */
  public fullfiliInviteForm(user: IUser): Onboarding {
    $(this.shareEmail).setValue(user.shareAddress);
    $(this.shareFirstName).setValue(user.shareFirstName);
    $(this.shareLastName).setValue(user.shareLastName);
    return this;
  }

  /**
   * Select business type by name
   * for step 'Choose your Business Type'
   *
   * @param {string} businessType
   * @returns {Onboarding}
   * @memberof Onboarding
   */
  public selectBusinessType(businessType: string): Onboarding {
    const el = $$(this.businessTypeList).find(
      x => x.getText() === businessType
    );
    try {
      el.click();
    } catch (error) {
      // will not throw error for negative scenarios check
      // tslint:disable-next-line:no-console
      console.error(
        `Negative scenario check:\nTrying to select business type for ${businessType}`,
        error
      );
    }
    return this;
  }

  /**
   * Get all spinner text
   *
   * @returns {string[]}
   * @memberof Onboarding
   */
  public getFetchingSpinnerText(): string[] {
    return super.getSpinnerText(`${this.spinner} > h1,p`);
  }

  /**
   * Get active step from progress-list
   *
   * @returns {string}
   * @memberof Onboarding
   */
  public getCurrentStep(): string {
    $(this.currentStep).waitForDisplayed(browser.options.waitforTimeout * 10);
    const curStep = $(this.currentStep);
    return curStep.getText();
  }

  /**
   * Click on next step button
   *
   * @returns {Onboarding}
   * @memberof Onboarding
   */
  public submit(): Onboarding {
    $(this.nextButton).waitForEnabled();
    $(this.nextButton).click();
    return this;
  }

  /**
   * Click on Connect to FB
   *
   * @returns {void}
   * @memberof Onboarding
   */
  public clickOnConnectToFacebook(): void {
    $(this.connectToFacebook).waitForDisplayed(5000);
    $(this.connectToFacebook).click();
  }

  /**
   * Onboarding step contain text
   *
   * @returns {string}
   * @memberof Onboarding
   */
  public onboardingConnectedFbMessage(): string {
    const pageElementWithText = ".Onboarding-socialAnalyticsIntegration-message>div";
    $(pageElementWithText).waitForDisplayed(5000);
    return $(pageElementWithText).getText();
  }

}

export { Onboarding };
