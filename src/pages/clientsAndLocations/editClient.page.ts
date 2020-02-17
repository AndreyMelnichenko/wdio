import { URL } from 'url';
import { BasePage } from "../base.page";

class EditClient extends BasePage {
    public pageUrl = new URL(`${browser.options.baseUrl}clients-and-locations/edit-client`);
    public elementLocator = "//h1[text()='Edit Client: ']";
}

export { EditClient };
