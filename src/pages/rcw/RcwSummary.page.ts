export class RcwSummaryPage {

    private runnedReportItem: string = ".side-bar-progress[data-side-bar-item='%s']";
    private pageHeaderText:string = "//li[@class='current' and text()='View Location Summary:']";

    public waitPageLoaded():RcwSummaryPage{
        $(this.pageHeaderText).waitForDisplayed(5000);
        return this;
    }

    public isReportRunned(itemName:string):boolean{
        console.log("Wait for: ["+itemName+"]");
        const itemSelector = this.runnedReportItem.replace("%s",itemName);
        browser.waitUntil(
            () => $(itemSelector).isClickable(),
            5000,
            "Element ["+ itemName + "] still not visible\n Selector: ["+itemSelector+"]");
        return $(itemSelector).isClickable();
    }
}
