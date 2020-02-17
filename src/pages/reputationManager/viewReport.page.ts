import { URL } from 'url';
import { BasePage } from "../base.page";

class RMViewReport extends BasePage {
    public pageUrl: URL = new URL(`${browser.options.baseUrl}rm/reports`);
    public elementLocator: string = "//h2[text()='Overview']";

    public getReportName() {
        browser.pause(1000);
        return $("h1").getText();
    }
    public getTotalReviews() {
        browser.pause(1000);
        return $('//div[text()="Total Reviews"]/following::div[1]').getText();
    }
}
export { RMViewReport };
