export class ExternalLocationDashboard{
    private reportItem:string = "//div[@class='wl-welcome-reports-list']//span[text()='%s']";

    public openExternalReport(reportName:string):ExternalLocationDashboard{
        const elementLocator:string = this.reportItem.replace("%s",reportName);
        $(elementLocator).waitForDisplayed(5000);
        $(elementLocator).click();
        return this;
    }
}
