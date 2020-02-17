import { expect } from 'chai';
import {TableDefinition, Then} from "cucumber";
import {IRankCheckerAddReport} from "../models/RankCheckerAddReport";
import {AddLSRCReport} from "../pages/rankChecker/addReport.page";

Then(/^Full fill add report Rank Checker with data:$/, function (data: TableDefinition) {
    const addReportPage: AddLSRCReport = new AddLSRCReport();
    const addReportdata: IRankCheckerAddReport = data.hashes()[0];
    // console.log(addReportdata);
    addReportPage.openLocationDropdown()
        .chooseLocation(addReportdata.locationName);
});

Then(/^report name equal '(.*)'$/,function (reportName:string) {
    const addReportPage: AddLSRCReport = new AddLSRCReport();
    addReportPage.checkReportName(reportName)
});

Then(/^report schedules as '(.*)'$/,function (scheduledValue:string) {
    const addReportPage: AddLSRCReport = new AddLSRCReport();
    addReportPage.isScheduledValue(scheduledValue);
});

Then(/^report Business website URL not empty$/,function () {
    const addReportPage: AddLSRCReport = new AddLSRCReport();
    addReportPage.isWebSiteNotEmpty();
});

Then(/^report business country has '(.*)'$/,function (countryName:string) {
    const addReportPage: AddLSRCReport = new AddLSRCReport();
    addReportPage.isBusinessCountryValue(countryName);
});

Then(/^report bsiness city has '(.*)'$/,function (cityName:string) {
    const addReportPage: AddLSRCReport = new AddLSRCReport();
    addReportPage.isBusinessCityValue(cityName);
});

Then(/^report search terms has '(.*)'$/,function (searchTerms:string) {
    const addReportPage: AddLSRCReport = new AddLSRCReport();
    addReportPage.setSearchTerms(searchTerms);
});

Then(/^click on Add Report button$/,function () {
    const addReportPage: AddLSRCReport = new AddLSRCReport();
    addReportPage.clickOnAddReport();
});

Then(/^page scroll up$/,function () {
    const addReportPage: AddLSRCReport = new AddLSRCReport();
    addReportPage.isPageScroledUp();
});

Then(/^report has (no any|all|one) checked search engine$/,function (searchEngineValue:string) {
    const addReportPage: AddLSRCReport = new AddLSRCReport();
    switch (searchEngineValue) {
        case 'no any':
            expect(addReportPage.getCheckedSearchEngines()).to.equal(0);
            break;
        case 'one':
            if(addReportPage.getCheckedSearchEngines()===0){
                addReportPage.setRandomSearchEngine();
            }else if (addReportPage.getCheckedSearchEngines()>1){
                addReportPage.uncheckAllSearchEngines();
            }
            break;
        default:
            throw new Error(`Invalid switch argument ${searchEngineValue}`);
    }
});
