import {expect} from 'chai';
import {Given, TableDefinition, Then, When} from 'cucumber';
import {IUser} from '../models/User';
import {GoogleSignIn} from '../pages/3rd-parties/google.signin.page';
import {BasePage} from '../pages/base.page';
import {CampaignDetailsFillFormPage} from "../pages/citationBurst/campaignDetailsFillFormPage";
import {ClientAndLocationLeaderBoard} from "../pages/clientsAndLocations/clientAndLocationLeaderBoard";
import {Login} from '../pages/login.page';
import {ImportYourLocations} from "../pages/onboarding/importYourLocations";
import {PageFactory} from '../pages/pageFactory';
import {AddRMReport} from '../pages/reputationManager/addReport.page';
import {GetReviews} from '../pages/reputationManager/getReviews.page';
import {Constants} from '../utils/constants';
import {DriverHelper} from '../utils/driverHelper';
import {Helper} from '../utils/helper';


When(/^user close modal pop-up$/, function () {
    BasePage.closeModal();
});

When(/^user (clicks|is on) "(.*)" tab$/, function (action: string, tabName: string) {
    BasePage.clickOnTab(tabName);
    new GetReviews().waitUntilSpinnerEnd('.Wave-wave');
});

When(/^user do mouseover info-incon '(.*)'$/, function (text: string) {
        BasePage.mouseoverOnInfoIcon(text);
    }
);
When(/^user scroll down (\d+) times$/, function (params: number) {
    BasePage.unfocus();
    BasePage.scrollDown(params);
    browser.pause(200);
});

When(/^user wait for '(\d+)' sec$/, function (timeout: number) {
    browser.pause(timeout * 1000);
});

When(/^search for "(.*)" by "(.*)"$/, function (txt: string, inputSearch: string) {
    const input = Helper.replaceWithWorldValue(txt, this);
    BasePage.setInputValue(input, inputSearch);
    BasePage.clickOnButton('ClientsLocations-Locations-search-submitButton');
});

When(/^submits login form with:$/, function (data: TableDefinition) {
    const randomPrefix = Helper.getRandomForString(
        data.raw().join(),
        Constants.RANDOM_MARKER
    );
    const user: IUser = Helper.applyRandom(
        data,
        Constants.RANDOM_MARKER,
        randomPrefix
    ).hashes()[0] as IUser;
    new Login().setUser(user);
});

Given(/^user is on '(.*)' page: "(.*)"$/, function (page: string, path: string) {
    if (page === "Login" || page === "Signup" || page === "SignupCb") {
        browser.deleteCookie();
        browser.refresh();
    }
    const currentPage = PageFactory.getPageForName(page);
    path = path.startsWith('/') ? path.slice(1, path.length) : path;
    const urlToOpen:string = Helper.replaceWithWorldValue(path, this, '%');
    browser.pause(1000);
    currentPage
        .open(urlToOpen);
    currentPage.waitForLoad();
});

Given(/^logged-in user is on the '(.*)' page "(.*)":$/, function (
    page: string,
    path: string,
    data: TableDefinition
) {
    path = path.startsWith('/') ? path.slice(1, path.length) : path;
    loggedInUser(data.hashes()[0]).open(Helper.replaceWithWorldValue(path, this));
    this.setPage(PageFactory.getPageForName(page));
    this.getPage().waitForLoad();
    this.setUser(data.hashes()[0]);
});

When(/^keep the (field|input) value at "(.*)" as "(.*)"$/, function (
    elmType: string,
    elmTxt: string,
    varName: string
) {
    let value: string;
    switch (elmType) {
        case 'field':
            value = BasePage.getFieldValue(elmTxt);
            break;
        case 'input':
            value = BasePage.getInputFieldValue(elmTxt);
            break;
        default:
            throw new Error('wrong elment type');
    }

    this.keepValue(varName, value);
});

When(/^user navigates back$/, function () {
    browser.back();
});

When(/^user reload '(.*)' page$/, function (page: string) {
    const curPage = PageFactory.getPageForName(page);
    browser.refresh();
    browser.pause(300);
    curPage.waitForLoad();
});

Given(/^logged-in user is on the path "(.*)":$/, function (
    path: string,
    data: TableDefinition
) {
    loggedInUser(data.hashes()[0]).open(Helper.replaceWithWorldValue(path, this));
    this.setUser(data.hashes()[0]);
});

Given(/^Log-in the path "(.*)" with:$/, function (path: string, data: TableDefinition) {
    const user: IUser = data.hashes()[0];
    loggedInUser(user).open(path);
});

Given(/^user is on the path "(.*)"$/, function (
    path: string
) {
    BasePage.openPath(Helper.replaceWithWorldValue(path, this), false);
});

When(/^accept alert$/, function () {
    browser.pause(1000);
    browser.alertAccept();
});

Given(/^user is on url '(.*)'$/, function (url: string) {
    const uri = Helper.replaceWithWorldValue(url, this);
    BasePage.openURL(Helper.replaceWithBaseUrl(uri));
});


When(/^click on Download Locations Settings$/, function () {
    new DriverHelper().setChromeDownloadDir();
    BasePage.clickOnButton('/seo-tools/admin/clients-and-locations/location/settings');
});

When(/^wait for enabled and click '(.*)'$/, function (buttonTxt: string) {
    BasePage.waitForVisibleAndClick(buttonTxt);
});

When(/^click on visible '(.*)'$/, function (buttonName: string) {
    BasePage.clickOnVisibleButton(buttonName);
});

When(/^click on '(.*)'$/, function (bName: string) {
    BasePage.clickOnButton(bName);
});

When(/^wait and click on '(.*)'$/, function (bName: string) {
    BasePage.clickOnButton(bName, true);
});

When(/^click on '(.*)' and wait for spinner end$/, function (bName: string) {
    BasePage.clickOnButton(bName);
    $('.Wave-wave').waitForDisplayed(browser.options.waitforTimeout * 20, true);
});

When(/^click on button '(.*)'$/, function (buttonText: string) {
    BasePage.clickOnInputButton(buttonText);
});

When(/^click on '(.*)' or "(.*)"$/, function (bName: string, alterName: string) {
    if (BasePage.ifTextVisible(alterName)) {
        BasePage.clickOnButton(alterName);
    } else {
        BasePage.clickOnButton(bName);
    }
});

Then(/^click on Monitor Reviews$/, function () {
    BasePage.clickOnElement("//a[contains(@class,'button success large js-monitor-location-btn')]");
});

When(/^click on element '(.*)'$/, function (locator: string) {
    BasePage.clickOnElement(locator);
});
// TODO this step was replaced
When(/^click on "(.*)" button for any/, function (bName: string) {
    BasePage.clickOnButton(bName, true);
});

When(/^click on View Dashboard button for first Location/, function () {
    const clBoard = new ClientAndLocationLeaderBoard();
    clBoard.clickOnViewDashboardButton();
});

Then(/^wait for enabled and click on '(.*)'$/, function (name: string) {
    BasePage.clickOnVisibleButton(name);
});

Then(/^wait for visible and click on '(.*)'$/, function (name: string) {
    BasePage.clickOnVisibleButton(name, true);
});

When(/^checkbox '(.*)' is (checked|unchecked)$/, function (
    chBoxText: string,
    expState: string
) {
    if (BasePage.getCheckboxState(chBoxText) === expState.startsWith('un')) {
        BasePage.clickChBoxIput(chBoxText,5);
    }
});

When(/^validate checkbox '(.*)' is (checked|unchecked)$/, function (
    chBoxText: string,
    expState: string
) {
    const expRes = !expState.startsWith('un');
    expect(BasePage.getCheckboxState(chBoxText) === expRes);
});

When(/^click on '(.*)' link '(.*)'$/, function (txt: string, href: string) {
    BasePage.clickOnButtonHref(txt, href);
});

When(/^user login to Google$/, function (data: TableDefinition) {
    const user: IUser = data.hashes()[0];
    new GoogleSignIn().setEmail(user).setPassword(user);
});

When(/^select '(.*)' from list '(.*)'$/, function (
    value: string,
    listTxt: string
) {
    BasePage.useSelectize(value, listTxt, false);
});

When(/^choose '(.*)' from green dropdown '(.*)'$/, function (value: string, dropdownTitle: string) {
    BasePage.selectValueFromGreenDD(dropdownTitle, value);
});

When(/^keep a table context at "(.*)" as "(.*):"$/, function (name: string, varName: string, data: TableDefinition) {
    //
});

When(/^choose '(.*)' from list '(.*)'$/, function (
    value: string,
    listTxt: string
) {
    BasePage.useSelectizeDropDown(value, listTxt, true, false);
});

When(/^choose '(.*)' from list '(.*)' on Import Your Locations page$/, function (townName: string, listName:string) {
    const importYourLocations = new ImportYourLocations(townName);
    importYourLocations.chooseValueFromList(listName,townName);
});

// TODO track this step
When(/^if active choose '(.*)' from list '(.*)'$/, function (
    value: string,
    listTxt: string
) {
    BasePage.useSelectizeDropDown(value, listTxt, true, true);
});

When(/^choose '(.*)' from list of Extra business categories$/, function (value: string) {
    const campaignDetailsFillFormPage = new CampaignDetailsFillFormPage();
    campaignDetailsFillFormPage
        .fillExtraBusinessCategory(value);
});

When(/^choose valid '(.*)' from list '(.*)'$/, function (
    value: string,
    listTxt: string
) {
    if(value === 'Art Cafe'){
        const a = Helper.replaceWithWorldValue(value, this);
    }
    const targetValue = Helper.replaceWithWorldValue(value, this);
    BasePage.useSelectizeDropDown(targetValue, listTxt, false, true);
    // const b = BasePage.getInputDataValue(listTxt);
    expect(BasePage.getInputDataValue(listTxt).toLocaleLowerCase()).to.equal(targetValue.toLocaleLowerCase());
});

When(/^select value '(.*)' from list '(.*)'$/, function (
    value: string,
    listTxt: string
) {
    BasePage.selectOption(value, listTxt);
});

When(/^select an option '(.*)' from '(.*)'$/, function (
    option: string,
    textOrName: string
) {
    BasePage.selectOption(option, textOrName);
});

When(/^add valid '(.*)' to field '(.*)'$/, function (
    value: string,
    inputField: string,
) {
    // if (value.includes('RANDOM')) {
    //     value = value + Helper.getRandomForString(value);
    // }
    value = Helper.replaceWithWorldRandom(value, this);
    const erValue = BasePage.setInputValue(value, inputField);
    expect(erValue, 'Inserted value not equal to field').to.equal(value);
});

When(/^add '(.*)' to field '(.*)'$/, function (
    value: string,
    inputField: string,
) {
    value = Helper.replaceWithWorldRandom(value, this);
    BasePage.setInputValue(value, inputField);
});

When(/^user tries to access tool "(.*)" on path "(.*)"$/, function (
    name: string,
    path: string
) {
    BasePage.clickOnButtonHref('SEO Tools', '#');
    BasePage.clickOnButtonHref(name, path);
});

Then(/^wait until wizard loads$/, function () {
    new GetReviews().waitUntilSpinnerEnd('.Wave-wave');
});

Given(/^user setup feedback template as "(.*)"$/, function (
    varName: string,
    data: TableDefinition
) {
    const page: GetReviews = new GetReviews();
    this.randomPrefix = Helper.getRandomForString(data.raw().join());
    const feedbackData = Helper.applyRandom(
        data,
        Constants.RANDOM_MARKER,
        this.randomPrefix
    ).hashes()[0];
    console.log("All data compiled");
    console.log(feedbackData);
    page.waitForLoad();
    page.setupFeedbackTemplate(feedbackData);
    this.keepValue(varName, feedbackData);
});

When(/^user select '(.*)' from Sites to Track Reviews$/, function (
    site: string
) {
    const page = new AddRMReport();
    page.chooseDirecoryListing(site, true);
});

function loggedInUser(user: IUser): Login {
    const loginpage = new Login();
    loginpage.lazyLogin(user);
    return loginpage;
}
