import { Given, TableDefinition, When } from 'cucumber';
import { IKioskUser } from '../models/KioskUser';
import { BasePage } from '../pages/base.page';
import { KioskReview } from '../pages/reputationManager/kioskReview.page';
import { Constants } from '../utils/constants';
import { Helper } from '../utils/helper';

const page: KioskReview = new KioskReview();

Given(
  /^that there is (.*) on step (\d+) of Kiosk Mode$/,
  function checKiosField(ifExist: string, stepNumber: number) {
    // tslint:disable-next-line:no-console
    console.log(ifExist, stepNumber);
  }
);

When(/^user complete the feedback process:$/, function completeKios(
  data: TableDefinition
) {
  const user: IKioskUser = Helper.addTimestamp(Helper.applyRandom(
    data,
    Constants.RANDOM_MARKER,
    this.randomPrefix
  )).hashes()[0];
  page.setUser(user);
  page.completeFeedback();
});
