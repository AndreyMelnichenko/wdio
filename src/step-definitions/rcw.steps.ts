import { expect } from 'chai';
import { Then, When } from "cucumber";
import { Connection } from "mysql2/promise";
import { MySQLHelper } from "../db/mysqlHelper";
import {BasePage} from "../pages/base.page";
import {AddLocationPage} from "../pages/rcw/AddLocation.page";
import {IRcwLocation} from "../pages/rcw/IRcwLocation";
import {RcwKeywordSettings} from "../pages/rcw/RcwKeywordSettings.page";
import {RcwListingsReviewSources} from "../pages/rcw/RcwListingsReviewSources";
import {RcwSummaryPage} from "../pages/rcw/RcwSummary.page";
import {ReportsConnectionsWizardPage} from "../pages/rcw/ReportsConnectionsWizard.page";
import { Helper } from '../utils/helper';

When(/^user on '(.*)' page with path "(.*)"$/, function (page: string, url:string) {
    BasePage.closeDevBar();
    const rcwConnectionsWizard = new ReportsConnectionsWizardPage();
    rcwConnectionsWizard.isHeaderTextPresent(page);
    const actUrl:string = rcwConnectionsWizard.getRcwUrl();
    const actUrlPath = Helper.getUrlPath(actUrl);
    const id:string = Helper.getNuberFromString(actUrlPath);
    const expUrlPath = url.replace("{localion_id}",id).replace("\\#","#");
    expect(expUrlPath).to.equal(actUrlPath,"URL's doesn't mutch as expected");
});

When(/^subscriptions '(.*)' are selected$/,function (list:string) {
    const rcwConnectionsWizard = new ReportsConnectionsWizardPage();
    const toolListNames:string[] = list.split(";");
    toolListNames.map((element)=>{
       if(!rcwConnectionsWizard.isSubscriptionAvaliable(element)){
           // tslint:disable-next-line:no-unused-expression
           expect(rcwConnectionsWizard.isSubscriptionChecked(element)).to.be.true;
       }
    });
});

When(/^FB account is connected at RCW$/,function (){
    const rcwConnectionsWizard = new ReportsConnectionsWizardPage();
    // tslint:disable-next-line:no-unused-expression
    expect(rcwConnectionsWizard.isFBaccountConnecter()).to.be.true;
});

When(/^add text '(.*)' to keywords area$/,function (keyWords:string) {
    const rcwSearchEnginePage = new RcwKeywordSettings();
    if(keyWords.includes('RANDOM')){
        keyWords = keyWords.replace("RANDOM",Helper.getRandomForString(keyWords));
    }
    rcwSearchEnginePage
        .waitPageOpened()
        .setKeyWords(keyWords);
});

When(/^search engines from list '(.*)' is shown$/,function (itemList:string) {
    const rcwSearchEnginePage = new RcwKeywordSettings();
   const engineArr:string[] = itemList.split(";");
   engineArr.map((element)=>{
       // tslint:disable-next-line:no-unused-expression
       expect(rcwSearchEnginePage.isEngineExists(element)).to.be.true;
   })
});

When(/^user check specific search engines '(.*)'$/,function (searchEngineList:string) {
    const rcwSearchEnginePage = new RcwKeywordSettings();
    const engineArr:string[] = searchEngineList.split(";");
    rcwSearchEnginePage.checkSpecificSearchEngines(engineArr);
});

When(/^wait RCW reports are finish and click$/,function () {
    const rcwListingAndReviewSources = new RcwListingsReviewSources();
    rcwListingAndReviewSources.waitForReportsFinish().clickOnFinish()
});

When(/^wait RCW reports are finish$/,function () {
    const rcwListingAndReviewSources = new RcwListingsReviewSources();
    rcwListingAndReviewSources.waitForReportsFinish();
});

When(/^all reports from list start running '(.*)'$/,function (itemList:string) {
    const rcwSummaryPage = new RcwSummaryPage();
    const reportsArr:string[] = itemList.split(";");
    rcwSummaryPage.waitPageLoaded();
    reportsArr.map((element)=>{
        // tslint:disable-next-line:no-unused-expression
        expect(rcwSummaryPage.isReportRunned(element)).to.be.true;
    })
});

When(/^choose GMB location '(.*)'$/,function (locationName:string) {
    const rcwConnectionsWizard = new ReportsConnectionsWizardPage();
    rcwConnectionsWizard
        .waitForModalPresent()
        .clickOnGmbLocation(locationName);
});

When(/^Full fill add location RCW with data$/,function (rcwAddLocationDate: object) {
    const rcw:IRcwLocation = Helper.getIRcwLocation(rcwAddLocationDate);
    const addLocation = new AddLocationPage(rcw, this);
    addLocation.fulfillRcwAddLocation();
    this.keepValue("RCW",rcw);
});

Then(/^user can deselect any tool if he doesn't want to create report$/,function () {
    const rcwConnectionsWizard = new ReportsConnectionsWizardPage();
    const selectedTools:number = rcwConnectionsWizard.getCheckedToolBoxesAmount();
    const randomToolIndex:number = Helper.getRandomInt(0,selectedTools-1);
    rcwConnectionsWizard.clickOnToolBoxByIndex(randomToolIndex);
    const updatedSelectedToolsValue:number = rcwConnectionsWizard.getCheckedToolBoxesAmount();
    // tslint:disable-next-line:no-unused-expression
    expect(selectedTools>updatedSelectedToolsValue,"Amount checked tools after uncheck didn't changed").to.be.true;
});

Then(/^last selected tool couldn't be unchecked$/,function () {
    const rcwConnectionsWizard = new ReportsConnectionsWizardPage();
   rcwConnectionsWizard.deselectTools();
    // tslint:disable-next-line:no-unused-expression
   expect(rcwConnectionsWizard.isChekedAndBlokedTool()).to.be.true;
});

Then(/^go to created location$/,async function () {
    const rcw:IRcwLocation = this.findValue("RCW");
    const helper = new MySQLHelper();
    const conn: Connection = await helper.getConnection();
    const cleanUpTable = conn.format(`SELECT * FROM cl_customer_locations WHERE name = '${rcw["Location Name / Business Name"]}'`);
    const result = await helper.execute(cleanUpTable, conn);
    // tslint:disable-next-line:no-shadowed-variable
    const path = browser.options.baseUrl+"location-dashboard/location/%s/summary".replace("%s",result[0][0].location_id);
    browser.url(path);
});

When(/^user not able '(.*)' '(.*)' listing in listings_reviews$/,function (action:string,listingName:string) {
    const rcwListingPage:RcwListingsReviewSources = new RcwListingsReviewSources();
    rcwListingPage.isAbleToActionForListing(listingName,action);
});
