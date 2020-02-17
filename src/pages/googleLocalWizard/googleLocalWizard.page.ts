import { URL } from 'url';
import { BasePage } from '../base.page';

class GoogleLocalWizard extends BasePage {
  public pageUrl: URL = new URL(`${browser.options.baseUrl}gpw`);
  public elementLocator: string = "//h1[text()='Google My Business']";
}

export { GoogleLocalWizard };
