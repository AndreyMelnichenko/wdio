import {BasePage} from "../base.page";

export class OverviewPage extends BasePage{
    private searchInputSelector:string = ".Leaderboard-search-queryField";
    private elementSelector:string = ".current";
    private reportsOnPageList:string = ".ReportsTable-container tbody>tr";
    private searchButton:string = ".Leaderboard-search-submitButton";
    private resetSearchButton:string = ".Leaderboard-resetButton";
    private searchedRowText:string = "td.ReportsTable-name";
    private reportInfoBlock:string = "tbody .ReportsTable-name";

    public waitForPageLoad():OverviewPage{
        $(this.elementSelector).waitForDisplayed(5000);
        return this;
    }

    public isSearchFieldPresent():boolean{
        return $(this.searchInputSelector).isClickable();
    }

    public getAppearedReports():number{
        return $$(this.reportsOnPageList).length;
    }

    public searchBy(parameter:string):OverviewPage{
        $(this.searchInputSelector).setValue(parameter);
        this.clickOnSearch();
        browser.pause(1000);
        return this;
    }

    public clickOnSearch():OverviewPage{
        $(this.searchButton).waitForDisplayed(5000);
        $(this.searchButton).click();
        $(this.resetSearchButton).waitForDisplayed(5000);
        browser.pause(1000);
        return this;
    }

    public isSearchedResultContain(expectedText:string):boolean{
        $(this.searchedRowText).waitForDisplayed(5000);
        const actualText:string = $(this.searchedRowText).getText();
        return actualText.includes(expectedText);
    }

    public getReportsInfo():void{
        $$(this.reportInfoBlock).forEach((report)=>{
            const text = report.getText();
            const clientInfoObject:string[] = text.split("\n");
            const overviewInfo : IOverviewInfo = this.getOverviewInfoObject(clientInfoObject);
        })
    }

    private getOverviewInfoObject(data : string[]): IOverviewInfo {
        const overview : IOverviewInfo = null;
        overview.reportName= data[0];
        overview.city = data[1].split(",")[0];
        overview.postCode = data[1].split(",")[1].trim();
        if(data.length>2){
            overview.clientName = data[2].replace("Client:","").trim();
        }
        return overview;
    }

}

interface IOverviewInfo {
    reportName:string;
    city:string;
    postCode:string;
    clientName:string

}

export { IOverviewInfo }
