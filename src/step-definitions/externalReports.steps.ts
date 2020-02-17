import { expect } from 'chai';
import { Then } from "cucumber";
import { ExternalLocationDashboard } from "../pages/externalReports/externalLocationDashboard.page";
import { ExternalReportView } from "../pages/externalReports/externalReportView.page";

const externalLocationDashboard = new ExternalLocationDashboard();
const externalReportView = new ExternalReportView();

Then(/^user choose '(.*)' external report$/,function (reportName:string) {
    browser.switchToWindow(browser.getWindowHandles()[1]);
    externalLocationDashboard.openExternalReport(reportName);
});

Then(/^user open Get review tab with access password '(.*)'$/,function (password:string) {
    externalReportView.waitForPageLoad();
    // tslint:disable-next-line:no-unused-expression
    expect(externalReportView.isUserLogin()).to.be.false;
    externalReportView.switchToGetReviewsTab()
        .setPasswordForReviewReport(password);
    // tslint:disable-next-line:no-unused-expression
    expect(externalReportView.isUserLogin()).to.be.true;
});
