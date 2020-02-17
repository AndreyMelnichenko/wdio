import { URL } from "url";
import { BasePage } from "../base.page";

class RMEditReport extends BasePage {
    public pageUrl: URL = new URL(`${browser.options.baseUrl}rm/reports`);
    public elementLocator: string = "//h2[text()='General Settings']";
    private reportActionDropDown:string = ".ReportsTable-actionsWrapper>button.is-dropdown";
    private editReport:string = "//ul[@class='LeaderboardReportActions-list' ]/li[text()=' Edit']";

    public openDropDownActions():RMEditReport{
        $(this.reportActionDropDown).waitForDisplayed(5000);
        $(this.reportActionDropDown).click();
        browser.waitUntil(
            () => {
                return $(this.editReport).isClickable();
            },
            5000,
            'button still invisible'
        );
        return this;
    }

    public clickOnEdit():RMEditReport{
        $(this.editReport).click();
        return this;
    }

}
export { RMEditReport };
