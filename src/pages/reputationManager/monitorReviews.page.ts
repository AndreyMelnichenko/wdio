import { URL } from 'url';
import { ReputationManager } from "./reputationManager.page";

class MonitorReviews extends ReputationManager {
    public pageUrl: URL = new URL(`${this.pageUrl.href}/\d+`);
    public elementLocator: string = "//*[normalize-space(text())='Get Reviews']";
    public spinner = '.Wave-wave';
}

export { MonitorReviews };
