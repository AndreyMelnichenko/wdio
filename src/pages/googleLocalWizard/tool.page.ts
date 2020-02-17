import { URL } from "url";
import { GoogleLocalWizard } from "./googleLocalWizard.page";

class GoogleLocalWizardTool extends GoogleLocalWizard {
  public pageUrl: URL = new URL(`${this.pageUrl.href}/tool`);
  public elementLocator: string = "//*[text()='Report Settings']";
}

export { GoogleLocalWizardTool };
