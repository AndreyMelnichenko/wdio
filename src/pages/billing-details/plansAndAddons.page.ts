import { URL } from 'url';
import { BillingDetails } from './billing-details.page';

abstract class PlansAndAddons extends BillingDetails {
  public pageUrl: URL = new URL(`${this.pageUrl.href}#packages-and-addons`);
  public elementLocator: string =
    'a[href="#packages-and-addons"][aria-selected=true]';
}

export { PlansAndAddons };
