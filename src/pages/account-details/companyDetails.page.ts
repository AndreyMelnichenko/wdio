import { URL } from "url";
import { Account } from "./account.page";

class MyCompanyDetails extends Account {
  public pageUrl: URL = new URL(`${this.pageUrl.href}#mycompany`);
  public elementLocator: string = `${
    this.elementLocator
    }/following::h2[text()='Manage Your Company Listing']`;
}

export { MyCompanyDetails };
