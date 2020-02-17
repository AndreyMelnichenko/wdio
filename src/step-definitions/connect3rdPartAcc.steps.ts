import { StepDefinitionOptions, TableDefinition, Then } from 'cucumber';
import { FacebookLogin } from '../pages/3rd-parties/facebook.login.page';
import { GoogleSignIn } from '../pages/3rd-parties/google.signin.page';
import { BasePage } from '../pages/base.page';

interface IOpts extends StepDefinitionOptions {
  timeout?: number;
  wrapperOptions?: { retry: number };
}

const opt: IOpts = { wrapperOptions: { retry: 3 } };

// user should be able to connect 'Google' account by clicks on 'Import GMB Locations'
Then(
  /^user should be able to connect '(.*)' account by click on '(.*)':$/,
  opt,
  function (accountType: string, bName: string, data: TableDefinition) {
    BasePage.closeSideOpenedTab(0);
    BasePage.clickOnButton(bName);
    BasePage.connectAccount(accountType, data);
  }
);

Then(
  /^user should be able to connect '(.*)' account:$/,
  function (accountType: string, data: TableDefinition) {
    BasePage.connectAccount(accountType, data);
  }
);
