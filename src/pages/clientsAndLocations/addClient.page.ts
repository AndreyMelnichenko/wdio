import { URL } from 'url';
import { BasePage } from "../base.page";

class AddClient extends BasePage {
    public pageUrl = new URL(`${browser.options.baseUrl}clients-and-locations/add-client#clients`);
    public elementLocator = "//h1[text()='Add a Client']";
}

export { AddClient };
