import { expect } from 'chai';
import moment = require("moment");
import { Helper } from "../../utils/helper";

export class ReviewInboxPage {
    private pageHeader:string = "//h1[text()='Review Inbox']";
    private dateArraySelector:string = "//div[@class='DateBodyCell-date']";
    private dateFormatOnPage:string = "DD MMM YYYY";
    private reportColumnsName:string = "table th[style~='width:']";
    private reportNames:string = "tbody td .ReportBodyCell-nameText";
    private reportDate:string = "tbody td .DateBodyCell-date";
    private reportSrc:string = "tbody td .ReviewSource-name";
    private reportAvgRaiting:string = "tbody td .AverageRating-value";
    private reportReviwer:string = "tbody td .ReviewReviewer-label";
    private reportStatusButton:string = "tbody td button";
    private reportView:string = "tbody td a[class]";
    private dropDownFilter:string = ".DataViewer-head button.is-null";
    private filterOptionsForm:string = "form.FilterOptions-container";
    private filterOptionsSections:string = "//div[@class='FilterOptions-sectionHeader' and text()='%s']";
    private filterSubOptions:string = "/following-sibling::label/span[text()='%s']";
    private filterSrcSubOptions:string = '/following-sibling::div//span[contains(text(),"%s")]';
    private noResultsMessageText:string = "tbody td.Table-emptyMessage";
    private currentPageOnPagination:string = ".paging-list>.current>a";
    private paginationInfo:string = ".Pagination-info";
    private statusFolderButton:string = "//div[contains(@class,'StatusFolders-button') and contains(text(),'%s')]";
    private activeStatusFolderButton:string = "//div[contains(@class,'is-active') and contains(text(),'%s') and contains(@class,'StatusFolders-button')]";
    private resetButton:string = "//button[text()='%s']";
    private avgRating:string = "//td//span[@class='AverageRating-value']";
    private spinner:string = ".Wave-wave";
    private currentStatuses:string = "//button[contains(@class,'StatusBodyCell-statusButton')]"; // and text()='%s']";
    private recordWithStatus:string = "//button[contains(@class,'StatusBodyCell-statusButton') and text()='%s']";
    private dropDownStatus:string = "//div[contains(@class,'is-opened')]";

    public setReviewStatusTo(statusName:string):ReviewInboxPage{
        $(this.currentStatuses).click();
        $(this.dropDownStatus).waitForDisplayed(5000);
        $(this.dropDownStatus+"//li[text()='%s']".replace("%s",statusName)).click();
        $(this.dropDownStatus).waitForDisplayed(5000,true);
        return this;
    }

    public getReviewWithStatus(statusName:string):string{
        browser.pause(2000);
        return $$(this.recordWithStatus.replace("%s",statusName)).length.toString();
    }

    public isAvgRatingHas(expectedRatin:string):ReviewInboxPage{
        // const elementSelector:string = this.avgRating.replace("%s",expectedRatin);
        $$(this.avgRating).forEach(element=>{
            // console.log(expectedRatin+" and "+element.getText());
            expect(expectedRatin, "Expected rating not much actual: "+expectedRatin+" and "+element.getText())
                .to.equal(element.getText());
        });
        return this;
    }

    public pageIsLoaded():ReviewInboxPage{
        $(this.pageHeader).waitForDisplayed(5000);
        return this;
    }

    public getNoResultMessageText():string{
        $(this.noResultsMessageText).waitForDisplayed(5000);
        return $(this.noResultsMessageText).getText();
    }

    public isResetButton(btnName:string):boolean{
        const selectorBtn:string = this.resetButton.replace("%s",btnName);
        return $(selectorBtn).isClickable();
    }

    public clickOnResetButton():ReviewInboxPage{
        const selectorBtn:string = this.resetButton.replace("%s","Reset");
        $(selectorBtn).click();
        browser.waitUntil(
            () => {
                return !browser.isClickable(selectorBtn);
            },
            5000,
            'Reset button still visible'
        );
        return this;
    }

    public isCurentPageNimber(expecredPageNumber:string):ReviewInboxPage{
        $(this.currentPageOnPagination).waitForDisplayed(5000);
        const actualPageNumber:string = $(this.currentPageOnPagination).getText();
        expect(expecredPageNumber,'User located not on ['+expecredPageNumber+'] page').to.equal(actualPageNumber);
        return this;
    }

    public isStatusFolderButton(status:string):boolean{
        const selector:string = this.statusFolderButton.replace("%s",status);
        return $(selector).isClickable();
    }

    public clickOnStatusFolderButton(statusName:string):ReviewInboxPage{
        const selector:string = this.statusFolderButton.replace("%s",statusName);
        $(selector).click();
        browser.pause(500);
        this.waitSpinner();
        browser.waitUntil(
            () => {
                return browser.isClickable(this.activeStatusFolderButton.replace("%s",statusName));
            },
            5000,
            'Active status folder button not choosed '+
            this.activeStatusFolderButton.replace("%s",statusName)
        );
        return this;
    }

    private waitSpinner():void{
        if($(this.spinner).isClickable()){
            $(this.spinner).waitForDisplayed(5000,true);
        }
    }

    public getPaginationInfo():string{
        browser.pause(1000);
        browser.waitUntil(
            () => {
                return browser.isClickable(this.paginationInfo);
            },
            10000,
            'Pagination info dont appeared'
        );
        return $(this.paginationInfo).getText();
    }

    public isEmptyMessage():ReviewInboxPage{
        return this;
    }

    public clickOnApplyFilterButton():ReviewInboxPage{
        const elementSelector:string = this.filterOptionsForm+" button";
        $(elementSelector).click();
        this.waitSpinner();
        return this;
    }

    public isRocordSortedByDate():boolean{
        const review:string[]=[];
        $$(this.dateArraySelector).forEach((element)=>review.push(element.getText()
            .replace("th","")
            .replace("nd","")));
        // review.forEach(a=>console.log(a));
        return this.isDateSortedFromNewToOld(review);
    }

    private isDateSortedFromNewToOld(dateArr:string[]):boolean{
        let defSortState:boolean = true;
        let prevDate;
        let currentDate;
        for(let i = 0; i< dateArr.length-1; i++){
            if(i!==0){
                prevDate =  moment(dateArr[i-1],this.dateFormatOnPage).toDate();
                currentDate = moment(dateArr[i],this.dateFormatOnPage).toDate();
                if(!(prevDate >= currentDate)){
                    defSortState = false;
                }
                // console.log(prevDate>currentDate, " and [true] => ", prevDate>currentDate && true, " general state => ", defSortState);
            }
        }
        return defSortState;
    }

    public isTableContainListOfItems(expectedItems:string[]):boolean{
        const actualTableItems:string[]=[];
        let status:boolean;
        $$(this.reportColumnsName).forEach((element)=>actualTableItems.push(element.getText()));
        try{
            expect(actualTableItems).to.have.members(expectedItems);
            status = true;
        }catch (e) {
            status = false;
        }
        return status;
    }

    public checkTableContent(columnName:string):void{
        switch (columnName) {
            case 'Report':
                this.isReportColumnEmpty(this.reportNames);
                break;
            case 'Date':
                this.isReportColumnEmpty(this.reportDate);
                break;
            case 'Rating':
                this.isReportColumnEmpty(this.reportAvgRaiting);
                break;
            case 'Review':
                this.isReportColumnEmpty(this.reportReviwer);
                break;
            case 'Status':
                this.isReportColumnEmpty(this.reportStatusButton);
                break;
            case 'Action':
                this.isReportColumnEmpty(this.reportView);
                break;
            case 'Source':
                this.isReportColumnEmpty(this.reportSrc);
                this.isSrcDirValid();
                break;
        }

    }

    private isReportColumnEmpty(selector:string):void{
        $$(selector).forEach(element=>{
            // tslint:disable-next-line:no-unused-expression
            expect(this.isElementEmpty(element),
                "Some Report column is EMPTY! see selector: ["+selector+"]").to.be.false;
        });
    }

    private isElementEmpty(element:WebdriverIO.Client<WebdriverIO.RawResult<WebdriverIO.Element>>):boolean {
        return element.getText() === '';
    }

    private isSrcDirValid():void{
        const srcDirs:string[] = Helper.getActualDirectiries();
        $$(this.reportSrc).forEach(element=>{
            // tslint:disable-next-line:no-unused-expression
            expect(srcDirs.some(a => ( a === element.getText())),"Some SRC doesn't much defined list /src/fixtures/src.json").to.be.true;
        });
    }

    public isFilteredDir(sourceName:string):ReviewInboxPage{
        // const elementSelector:string = this.reportSrc.replace("%s",sourceName);
        $$(this.reportSrc).forEach(element=>{
            // console.log(sourceName+" and "+element.getText());
            expect(sourceName, "Expected rating not much actual: "+sourceName+" and "+element.getText())
                .to.equal(element.getText());
        });
        return this;
    }

    public clickFilterDropDown():void{
        $(this.dropDownFilter).click();
        // filterOptionsForm
        browser.waitUntil(
            () => {
                return browser.isClickable(this.filterOptionsForm);
            },
            5000,
            'filter Options Form didnt appeared'
        );
    }

    public isOptionsApeared(item:string, subItem?:string):boolean{
        let elementSelector:string = '';
        if (subItem){
            elementSelector = this.buildSelector(item,this.filterOptionsSections,subItem,this.filterSubOptions);
        } else {
            elementSelector = this.buildSelector(item,this.filterOptionsSections);
        }
        return $(elementSelector).isClickable();
    }

    public clickOnSectionItem(item:string, subItem:string):ReviewInboxPage{
        const elementSelector:string = this.buildSelector(item,this.filterOptionsSections,subItem,this.filterSubOptions);
        $(elementSelector).click();
        return this;
    }

    public setFilterSrcOption(sectionName:string, optionName:string):ReviewInboxPage{
        const elementSelector:string = this.buildSelector(sectionName, this.filterOptionsSections,optionName,this.filterSrcSubOptions);
        $(elementSelector).click();
        return this;
    }

    private buildSelector(parentSelectorText:string, parentSelector:string, subSelectorText?:string, subSelector?:string):string{
        if(subSelector && subSelectorText){
            const selector: string = parentSelector
                .replace("%s",parentSelectorText)
                + subSelector
                    .replace("%s",subSelectorText);
            return selector;
        } else if (subSelector){
            const selector:string = parentSelector
                    .replace("%s",parentSelectorText)
                + subSelector;
            return selector;
        } else {
            return parentSelector.replace("%s",parentSelectorText);
        }
    }

    public isScrOptionsVisible(srcSectionName:string, srcItem:string):boolean{
        // $$("//div[@class='FilterOptions-sectionHeader' and text()='Review Sources']/following-sibling::div//span").forEach(a=>console.log(a.getText()));
        const elementSelector:string = this.buildSelector(srcSectionName, this.filterOptionsSections)
        +this.buildSelector(srcItem,this.filterSrcSubOptions);
        return $(elementSelector).isClickable();
    }

    public getFilteredResultCount():number{
        const filteredList:number = $$(this.reportNames).length;
        return filteredList;
    }
}
