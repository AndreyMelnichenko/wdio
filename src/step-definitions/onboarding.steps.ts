import { expect } from 'chai';
import { Given, TableDefinition, Then, When } from 'cucumber';
import { IUser } from '../models/User';
import { BasePage } from '../pages/base.page';
import { Onboarding } from '../pages/onboarding.page';
import { ImportYourLocations } from '../pages/onboarding/importYourLocations';
import { OnboardingStartPage } from "../pages/onboarding/onboardingStartPage";
import { Constants } from '../utils/constants';
import { Helper } from '../utils/helper';

const page: Onboarding = new Onboarding();
const importLocationsSteps = new ImportYourLocations("London");

Then(/^user should be (?:on|directed to|stay on) step '(.*)'$/, function (
  stepName: string
) {
  expect(page.getCurrentStep(),'Current url '+browser.getUrl()).to.equal(stepName);
});

When(/^user choose businessType as '(.*)'$/, function (bType: string) {
    const onboarding = new OnboardingStartPage();
    onboarding.choseYourBusinessType(bType);
    if(bType === 'Single Location Business'){
        const expectedText:string = 'How many locations are you looking to manage?';
        expect(
            BasePage.ifTextExist(expectedText, 1),
            `${expectedText} doesnt exist on page`
        ).to.equal(false);
    }

});

When(/^choose locations count as '(.*)'$/, function (locationsCount: string) {
    const expectedText:string = 'How many locations are you looking to manage?';
    if(locationsCount!=='0'){
        BasePage.useSelectizeDropDown(
            locationsCount,
            expectedText,
            false,
            false
        );
    }else {
        expect(
            BasePage.ifTextExist(expectedText, 1),
            `${expectedText} doesnt exist on page`
        ).to.equal(false);
    }
});

When(/^user fulfill share form with:$/, function (data: TableDefinition) {
  const userData: TableDefinition = Helper.applyRandom(
    data,
    Constants.RANDOM_MARKER,
    Helper.getRandomForString(data.raw().join(), Constants.RANDOM_MARKER)
  );

  page.fullfiliInviteForm(userData.hashes()[0] as IUser);
});

When(
  /^user is on step '(Choose your Business Type|Import your locations|Integrate social & analytics data|Customize your reports|Invite a team member)':$/,
  function (stepName: string, data: TableDefinition) {
      while (page.getCurrentStep() !== stepName) {
          const cStep: string = page.getCurrentStep();
          switch (cStep) {
              case 'Choose your Business Type':
                  const onboarding = new OnboardingStartPage();
                  onboarding.choseYourBusinessType(data.hashes()[0]["businessType"]);
                  if (data.hashes()[0]["businessType"] !== 'Single Location Business') {
                      onboarding.setUpLocationsRange(data.hashes()[0]["locationsCount"]);
                  }
                  onboarding.clickToNextStep();
                  break;
              case 'Import your locations':
                  BasePage.ifTextExist('Import your locations');
                  BasePage.clickOnButton('Let’s find your business details');
                  BasePage.ifTextExist('Let’s find your location');
                  page.findLocation({
                      locationName: 'AAA - Automobile Club of Southern California',
                      locationAddress: 'Central Avenue, Riverside, CA, USA'
                  });
                  page.setLocationFromItemsList(0);
                  BasePage.ifTextExist('Use this location');
                  BasePage.clickOnButton('Use this location').ifTextExist(
                      'Nearly there! We just need to confirm the information for your location.'
                  );
                  const importLocations = new ImportYourLocations("");
                  importLocations.waitForDataBeChoosen("Town / City");
                  importLocations.waitNextStepButtonAndClick();
                  // BasePage.clickOnButton('Lets get tracking!');
                  page.waitForSpinner();
                  break;
              case 'Integrate social & analytics data':
                  page.submit();
                  break;
              case 'Customize your reports':
                  page.submit();
                  break;
              case 'Invite a team member':
                  page.submit();
                  break;
              default:
                  throw new Error(
                      `Test flow not implemented for ${page.getCurrentStep()}`
                  );
          }
      }
  }
);

When(/^user choose GMB account '(.*)'$/, function (name: string) {
  page.selectGMBAccount(name);
});

When(/^user choose (\d+)-st color scheme$/, function (index: number) {
  page.chooseColorScheme(index - 1);
});

Then(/^loading message should appear with text '(.*)'$/, function (
  text: string
) {
  expect(BasePage.ifTextExist(text)).to.equal(true);
  page.waitForSpinner();
});

Then(
  /^(?:.*)(?:.*|should be able to) choose (\d+)-st location from list$/,
  function (index: number) {
    page.setLocationFromList(index - 1);
  }
);

Then(
  /^(?:.*)(?:.*|should be able to) choose (\d+)-st location from items list$/,
  function (index: number) {
    page.setLocationFromItemsList(index - 1);
  }
);

Then(/^(?:.*)user should be able to find businnes by location$/, function (
  data: TableDefinition
) {
  // businnesName
  const ar = page.findLocation(data.hashes()[0]);
  expect(ar).to.deep.include(data.hashes()[0]);
});

Then(
  /^(?:.*)(?:.*|should be able to) choose '(.*)' location from list$/,
  function (locationName: string) {
    page.setLocationForName(locationName);
  }
);

Then(
    /^user should apply onboarding notify screen and click "(.*)"$/,
    function (btnName: string) {
      BasePage.clickOnButton(btnName);
    }
);

Then(
  /^onboarding step screen should contain text '(.*)'$/,
  function (screenText: string) {
    const isTextExists:boolean = importLocationsSteps.isPageContainText(screenText);
    // tslint:disable-next-line:no-unused-expression
    expect(isTextExists).to.be.true;
  }
);

Then(
  /^user should choose Let’s find your business details$/,
  function () {
    importLocationsSteps.clickOnFindYourBusiness();
  }
);

Then(
  /^user should see checked account$/,
  function () {
    importLocationsSteps.accountConnectedAndChecked();
  }
);

Then(
  /^user connect '(.*)' account$/,
  function (accountType: string,data: TableDefinition) {
    page.clickOnConnectToFacebook();
    browser.pause(1000);
    BasePage.connectAccount(accountType, data);
  }
);

Then(
  /^onboarding FB connected screen should contain '(.*)'$/,
  function (text: string) {
    const textOnPage = page.onboardingConnectedFbMessage();
    expect(textOnPage).to.include(text);
  }
);
