import { URL } from 'url';
import { IUser } from '../models/User';
import { BasePage } from './base.page';
import { ClientsAndLocations } from './clientsAndLocations.page';

class Login extends BasePage {
  public pageUrl = new URL(`${browser.options.baseUrl}login`);
  private user: IUser;
  public elementLocator = "//div[normalize-space(text())='Login to:']";

  /**
   * Login only if user shange
   *
   * @param {IUser} user
   * @returns {Login}
   * @memberof Login
   */
  public lazyLogin(user: IUser): Login {
    const currentUser = ''; // this.loginedUser().trim();
    if (currentUser !== user.email) {
      this.open('login')
        .setUser(user)
        .login().waitPageLoaded();
    }
    return this;
  }

  public setUser(user: IUser): Login {
    this.user = user;
    BasePage.addInputValues(
      {
        email: user.email,
        password: user.password
      },
      false,
      false
    );
    return this;
  }

  public fulfill(): Login {
    if (this.user) this.setUser(this.user);
    return this;
  }

  public login(): ClientsAndLocations {
    // browser.submitForm('form');
    if($("button.SignUp-loginForm-button").isClickable()){
      $("button.SignUp-loginForm-button").click();
    }
    $(this.elementLocator).waitForDisplayed(browser.options.waitforTimeout * 10,true);
    return new ClientsAndLocations();
  }

  public open(path?: string) {
    if (path === 'login') {
      // clear session cookies if we on login page
      browser.deleteAllCookies();
      browser.refresh();
    }
    // BasePage.closeOpenedTabs(true);
    return super.open(path);
  }

  public loginedUser(): string {
    this.open('account-details');
    const emailsField = $$('#email');
    let res = '';
    if (emailsField.length > 0) {
      res = emailsField[0].getValue();
    }
    return res;
  }
}

export { Login };
