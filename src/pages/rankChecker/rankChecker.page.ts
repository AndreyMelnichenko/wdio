import { URL } from 'url';
import { BasePage } from '../base.page';

class RankChecker extends BasePage {
  public pageUrl: URL = new URL(`${browser.options.baseUrl}lsrc`);
  public elementLocator: string = "//h1[text()='Rank Checker']";
}

export { RankChecker };
