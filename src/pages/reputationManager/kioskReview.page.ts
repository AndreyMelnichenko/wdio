import { URL } from 'url';
import { IKioskUser } from '../../models/KioskUser';
import { BasePage } from '../base.page';

class KioskReview extends BasePage {
  private user: IKioskUser;
  public pageUrl = new URL(`${new URL(browser.options.baseUrl).origin}/kiosk/`);
  public elementLocator = '#content > form .KioskContent-navText';
  private introText: string = '[data-target="kiosk.intro"]';
  private feedbackTextArea: string = 'textarea[name="feedback"]';
  private fieldError: string = '[data-target="kiosk.fieldError"]';
  private nextButton: string = '//button[@data-target="kiosk.nextButton"]';
  private userInputs: {
    name: string;
    email: string;
    allowUseReview: string;
    allowReceiveMarketingEmails: string;
  } = {
      name: '[name="name"]',
      email: '[name="email"]',
      allowUseReview: '[name="allowUseReview"]',
      allowReceiveMarketingEmails: '[name="allowReceiveMarketingEmails"]'
    };

  public setUser(user: IKioskUser): KioskReview {
    this.user = user as IKioskUser;
    return this;
  }

  public addFeedBack(text: string): KioskReview {
    $(this.feedbackTextArea).addValue(text);
    return this;
  }

  public getErrors() {
    return $$(this.fieldError).map(el => el.getText());
  }

  public addReting(rating: number): KioskReview {
    $(`//input[@value='${rating}']/ancestor::label`).click();
    return this;
  }

  public clickOnNext(): KioskReview {
    const el = $$(this.nextButton).filter(e => e.isClickable());
    el[0].click();
    return this;
  }

  public provideUserData(user: IKioskUser): KioskReview {
    const nameInput = $(this.userInputs.name);
    nameInput.waitForDisplayed();
    nameInput.addValue(user.name);
    $(this.userInputs.email).addValue(this.addTimestampToEmail(user.email));
    this.clickOnNext();
    BasePage.ifTextExist('Thank you for your feedback', 30);
    return this;
  }

  private addTimestampToEmail(email: string): string {
    return email.replace('@', `+${Date.now()}@`);
  }

  public completeFeedback(): KioskReview {
    this.waitForInit();
    BasePage.ifTextExist('Step 1 of 3');
    this.addReting(this.user.rating).clickOnNext();
    BasePage.ifTextExist('Step 2 of 3');
    this.addFeedBack(this.user.feedback)
      .checkInputField('allowUseReview', this.user.check_allowUseReview)
      .clickOnNext();
    BasePage.ifTextExist('Step 3 of 3');
    this.checkInputField(
      'allowReceiveMarketingEmails',
      this.user.check_allowReceiveMarketingEmails
    );
    return this.provideUserData(this.user);
  }

  private checkInputField(nameAttr: string, check: any): KioskReview {
    // TODO: add visibility test property to model
    const test = JSON.parse(check);
    if (BasePage.getCheckboxState(nameAttr) !== test) {
      BasePage.clickChBoxIput(nameAttr, 1500);
    }
    return this;
  }
}

export { KioskReview };
