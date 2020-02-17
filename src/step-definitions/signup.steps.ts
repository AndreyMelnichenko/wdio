import { expect } from 'chai';
import { TableDefinition, Then, When } from 'cucumber';
import { IUser } from '../models/User';
import { BasePage } from '../pages/base.page';
import { SelectType, Signup } from '../pages/signUp/signup.page';
import { Constants } from '../utils/constants';
import { Helper } from '../utils/helper';

const page: Signup = new Signup();

When(/^(?:.*)choose county from list '(.*)'$/, function (country: string) {
  page.selectCountryBy(
    country.length === 2 ? SelectType.COUNTRY_CODE : SelectType.NAME,
    country
  );
});

When(/^(?:.*)submits signup form with:$/, function (data: TableDefinition) {
  const randomPrefix = Helper.getRandomForString(
    data.raw().join(),
    Constants.RANDOM_MARKER
  );
  page.setUser(Helper.applyRandom(
    data,
    Constants.RANDOM_MARKER,
    randomPrefix
  ).hashes()[0] as IUser);
});

When(/^(?:.*)selects marketing option "(Yes|No)"$/, function (choise: string) {
  page.selectMarketingOpt(choise.startsWith('Y'));
});

When(/^(?:.*)agree with Terms & Conditions$/, function () {
  page.privacyOptAgree();
});
