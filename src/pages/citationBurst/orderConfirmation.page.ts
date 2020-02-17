import { URL } from "url";
import { CitationBurst } from "./citationBurst.page";

class OrderConfirmation extends CitationBurst {

    public getURL(): URL {
        return new URL(`${this.pageUrl.href}/campaigns/${this.pathId}/order-confirmation`);
    }
    public elementLocator: string = "//*[text()='Your Order Details']";
}

export { OrderConfirmation };
