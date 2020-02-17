import {URL} from "url";
import {BasePage} from "../base.page";

class SignupCb extends BasePage {
    public pageUrl: URL = new URL(`${browser.options.baseUrl}sign-up`);
    public elementLocator: string = "//*[text()='Get started from just $2 per site']";
}

export { SignupCb }
