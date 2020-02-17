import { URL } from "url";
import { IUser } from "../models/User";
import { BasePage } from "./base.page";

class LocationDashboard extends BasePage {
  public pageUrl = new URL(
    `${browser.options.baseUrl}location-dashboard/location/`
  );
  public elementLocator = "//*[text()='View Location Summary:']";
  private user: IUser;
}

export { LocationDashboard };
