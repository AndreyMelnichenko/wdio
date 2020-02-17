import { URL } from 'url';
import { IUser } from '../../models/User';
import { BasePage } from '../base.page';

class Signup extends BasePage {
  public pageUrl: URL = new URL(`${browser.options.baseUrl}sign-up`);
  public elementLocator: string = '//*[text()="Try BrightLocal free for 14 days"]';
  private countyList: string = 'select[name="country"]';
  private privacyOpt: string = 'input[name="privacyOptIn"]';
  private marketingOpt = {
    yes: 'input[name="marketingOptIn"][value="yes"]',
    no: 'input[name="marketingOptIn"][value="no"]'
  };
  private fullName: string = '#fullName';
  private email: string = '#email';
  private companyname: string = '#company-name';
  private password: string = '#password';

  public selectCountryBy(strategy: SelectType, country: string): Signup {
    switch (strategy) {
      case SelectType.NAME:
        browser
          .selectByVisibleText(this.countyList, country)
          .waitForValue(this.countyList);
        return this;
      case SelectType.COUNTRY_CODE:
        browser
          .selectByValue(this.countyList, country)
          .waitForValue(this.countyList);
        return this;
      default:
        throw new Error(`Unexpected strategy for select type ${strategy}`);
    }
  }

  public setUser(user: IUser): Signup {
    $(this.fullName).setValue(user.name);
    $(this.email).setValue(user.email);
    $(this.companyname).setValue(user.companyName);
    $(this.password).setValue(user.password);
    return this;
  }

  public privacyOptAgree(): Signup {
    browser.click(this.privacyOpt);
    return this;
  }

  public selectMarketingOpt(agree: boolean): Signup {
    browser.click(agree ? this.marketingOpt.yes : this.marketingOpt.no);
    return this;
  }

  public submit(): void {
    browser.submitForm('form');
  }
}

enum SelectType {
  NAME,
  COUNTRY_CODE
}

export { Signup, SelectType };
