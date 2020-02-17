import { URL } from 'url';
import { BasePage } from './base.page';

class ReportCreationWizard extends BasePage {
    public pageUrl = new URL(`${browser.options.baseUrl}report-creation-wizard`);
    public elementLocator: string = "//*[text()='Start Monitoring:']";
}

export { ReportCreationWizard };
