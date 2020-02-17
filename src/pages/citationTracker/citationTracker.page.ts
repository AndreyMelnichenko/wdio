import { URL } from 'url';
import { BasePage } from '../base.page';

class CitationTracker extends BasePage {
  public pageUrl: URL = new URL(`${browser.options.baseUrl}ct`);
  public elementLocator = "//h1[text()='Citation Tracker']";
}

export { CitationTracker };
