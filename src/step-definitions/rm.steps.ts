import { expect } from "chai";
import { Then } from "cucumber";
import { OverviewPage } from "../pages/reputationManager/overview.page";
import { Helper } from "../utils/helper";

const overviewPage:OverviewPage = new OverviewPage();

Then(/^page has search field input$/,function () {
    expect(overviewPage.waitForPageLoad()
        .isSearchFieldPresent(),"There is no presented search field").to.be.true;
});

Then(/^set search parameter '(.*)' as '(.*)' and apply$/,function (searchParameter:string,searchValue:string) {
    const targetValue = Helper.replaceWithRandomValueWorldArray(searchParameter, this);
    const nonFilteredReportsLenght:number = overviewPage.getAppearedReports();
    const filteredResult:number = overviewPage.searchBy(targetValue)
        .getAppearedReports();
    expect(nonFilteredReportsLenght,'Searching functionality not works with parameter ['+targetValue+"]").to.not.equal(filteredResult);
    this.keepValue(searchValue, targetValue);
});

Then(/^all found results contain '(.*)' value$/,function (searchParameter:string) {
    const targetValue = Helper.replaceWithWorldValue(searchParameter, this);
    // tslint:disable-next-line:no-unused-expression
    expect(overviewPage.isSearchedResultContain(targetValue),
        'Actual searched result not contain expected text => ['+targetValue+"]").to.be.true;
});
