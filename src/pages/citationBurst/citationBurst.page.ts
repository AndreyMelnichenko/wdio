import { URL } from 'url';
import { BasePage } from '../base.page';

class CitationBurst extends BasePage {
  public pageUrl: URL = new URL(`${browser.options.baseUrl}cb`);
  public elementLocator: string = "//h1[text()='Citation Builder']";
}

export { CitationBurst };
