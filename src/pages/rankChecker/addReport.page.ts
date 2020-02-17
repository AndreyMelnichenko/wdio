import { expect } from 'chai';
import {URL} from 'url';
import {Helper} from "../../utils/helper";
import {RankChecker} from './rankChecker.page';

class AddLSRCReport extends RankChecker {
    public pageUrl: URL = new URL(`${this.pageUrl.href}/reports/add`);
    public elementLocator: string = "//h1[text()='Rank Checker Report']";
    private locationInputDropDown: string = "//div[@class='selectize-control js-location-select single']/div[contains(@class,'has-options')]";
    private dropdownList: string = "//div[@class='selectize-dropdown single js-location-select' and contains(@style,'display: block;')]";
    private dropdownValue: string = "//div[contains(text(),'%s')]";
    private spinnerSelector: string = ".spinner-container";
    private searchTermsField:string = "#search_terms";
    private searchEnginesList:string = "search_engines[]";
    private searchEngines:string = ".search-engines-list>li";
    private addReportButton:string = "[value='Add Report']";

    private waitSpinner(): void {
        if ($(this.spinnerSelector).isClickable()) {
            $(this.spinnerSelector).waitForDisplayed(5000,true);
        }
    }

    public openLocationDropdown(): AddLSRCReport {
        $(this.locationInputDropDown).waitForDisplayed(5000);
        $(this.locationInputDropDown).click();
        $(this.dropdownList).waitForDisplayed(5000);
        return this;
    }

    public chooseLocation(locationName: string): AddLSRCReport {
        const elementSelector: string = this.dropdownList + this.dropdownValue.replace("%s", locationName);
        $(elementSelector).waitForDisplayed(5000);
        $(elementSelector).click();
        this.waitSpinner();
        return this;
    }

    public checkReportName(reportName: string): AddLSRCReport {
        const expectedReportName:string = Helper.getElementValueBySelector('#name');
        // console.log(expectedReportName);
        expect(expectedReportName).to.equal(reportName);
        return this;
    }

    public isScheduledValue(schedulePeriod: string): AddLSRCReport {
        const expectedScheduledValue:string = Helper.getSelectedTextBySelector('#schedule');
        expect(expectedScheduledValue,'Schedule report sould be rquals to '+schedulePeriod).to.equal(schedulePeriod);
        return this;
    }

    public isWebSiteNotEmpty():AddLSRCReport{
        const expectedReportName:string = Helper.getElementValueBySelector('[name="website_addresses[]"]');
        // tslint:disable-next-line:no-unused-expression
        expect(expectedReportName,'WEB url shoul not be EMPTY').to.not.equal('');
        return this;
    }

    public isBusinessCountryValue(businessCountry:string):AddLSRCReport{
        const expectedValue:string = Helper.getSelectedTextBySelector('#country');
        expect(expectedValue,'Business country should be equals to '+businessCountry).to.equal(businessCountry);
        return this;
    }

    public isBusinessCityValue(businessCity:string):AddLSRCReport{
        const expectedValue:string = Helper.getVisibleTextByFullSelector('.lsrc-location div.item');
        // console.log(expectedValue);
        expect(expectedValue,'Actual displayed city not contain expected: '+businessCity).to.have.string(businessCity);
        return this;
    }

    public setSearchTerms(searchTerms:string):AddLSRCReport{
        $(this.searchTermsField).waitForDisplayed(5000);
        $(this.searchTermsField).setValue(searchTerms);
        return this;
    }

    public setRandomSearchEngine():AddLSRCReport{
        $$(this.searchEngines)[Helper.getRandomInt(0,$$(this.searchEngines).length-1)].click();
        return this;
    }

    public uncheckSearchEngineByValue(engineValue:string):void{
        Helper.unCheckElementByValue(this.searchEnginesList,engineValue);
    }

    public uncheckAllSearchEngines():AddLSRCReport{
        Helper.scrollToElementByCss(this.searchEngines);
        const a:string[] = Helper.getValueCheckedCheckBoxes(this.searchEnginesList);
        a.forEach(b=>this.uncheckSearchEngineByValue(b));
        expect(this.getCheckedSearchEngines()).to.equal(0);
        return this;
    }

    public getCheckedSearchEngines():number{
        return Helper.getCheckedCheckBoxes(this.searchEnginesList);
    }

    public clickOnAddReport():void{
        Helper.scrollToElementByCss(this.addReportButton);
        browser.pause(1000);
        Helper.clickBySelector(this.addReportButton);
    }

    public isPageScroledUp():AddLSRCReport {
        browser.pause(500);
        expect($(this.elementLocator).isClickable()).to.be.true;
        return this;
    }
}

export {AddLSRCReport};
