import { expect } from 'chai';
import chai = require('chai');
// @ts-ignore
import chaiDateTime = require('chai-datetime');
// @ts-ignore
import chaiString = require('chai-string');
// @ts-ignore
import { Given, Status, TableDefinition, Then, When } from 'cucumber';
// @ts-ignore
import countries from "i18n-iso-countries";
// @ts-ignore
import moment = require('moment');
// @ts-ignore
import { Connection } from 'mysql2/promise';
import { URL } from 'url';
import { MySQLHelper } from '../db/mysqlHelper';
import {IUser} from "../models/User";
import {GmailLoginPage} from "../pages/3rd-parties/Gmail/gmail.login.page";
import { GoogleSignIn } from '../pages/3rd-parties/google.signin.page';
import { BasePage } from '../pages/base.page';
import { PageFactory } from '../pages/pageFactory';
import { RMViewReport } from '../pages/reputationManager/viewReport.page';
import { Constants } from '../utils/constants';
import { GmailClient, IGmailFilter } from '../utils/gmail.client';
import { Helper } from '../utils/helper';

const helper = new MySQLHelper();
chai.use(chaiString);
chai.use(chaiDateTime);

Then(/^field '(.*)' must have business category from location '(.*)'$/, async function (fieldName: string, location: string) {
  const fieldValue = BasePage.getSelectizeChoiceText(fieldName);
  const conn: Connection = await helper.getConnection();
  const businessCategoryId = Helper.replaceWithWorldValue(Helper.replaceWithWorldRandom(location, this), this);
  let result;
  const selectQ = conn.format(
    `SELECT
                *
            FROM
                business_categories
            WHERE
                id = '${businessCategoryId}'
              LIMIT 1`);

  result = await helper.execute(selectQ, conn);
  expect(fieldValue).to.be.equal(result[0][0].name);

});

Then(/^field '(.*)' must have iso-country '(.*)'$/, function (fieldName: string, location: string){
  const fieldValue = BasePage.getSelectizeChoiceText(fieldName);
  const countryIso = Helper.replaceWithWorldValue(Helper.replaceWithWorldRandom(location, this), this);
  const expectedValue = countries.getName(countryIso, "en").split(" ").slice(0,2).join(" ");
  expect(fieldValue).to.be.equal(expectedValue);
  }); 

Then(/^field '(.*)' is equal to field '(.*)'$/, function (field1: string, field2: string) {
  const field1Value = BasePage.getInputFieldValue(field1).trim();
  const field2Value = BasePage.getInputDataValue(field2).trim();
  expect(field2Value, 'Fields are not equal').to.be.equal(field1Value); // 'Fields are not equal'-error text
});

// matching by hostname

Then(/^equals "(.*)" to "(.*)"$/, function (ar: string, er: string) {
  ar = Helper.replaceWithWorldRandom(Helper.replaceWithWorldValue(ar, this), this);
  er = Helper.replaceWithWorldRandom(Helper.replaceWithWorldValue(er, this), this);
  expect(ar).to.be.equal(er);
});

Then(/^user (should|should not) be directed to directory url "(.*)"$/, function (condition: string, url: string, data: TableDefinition) {
  const exp: boolean = !condition.endsWith('not');
  const expURL: URL = new URL(Helper.replaceWithWorldValue(url, this));
  let currentUrl;

  if (exp) {
    BasePage.waitForTab(1);
    BasePage.switchTab("latest");
    currentUrl = BasePage.getPageURL();
    // Login google user if needed
    if (currentUrl.href.includes('accounts.google.com/signin')) {
      new GoogleSignIn().signIn(data.hashes()[0]);
      currentUrl = BasePage.getPageURL();
    }
    // check only host and path names
    expect(currentUrl.hostname).to.equal(expURL.hostname);
    expect(currentUrl.pathname).to.equal(expURL.pathname);
  } else {
    currentUrl = BasePage.getPageURL();
    expect(currentUrl.hostname).to.not.equal(expURL.hostname);
  }
});

Then(/^modal pop-up (should|should not) be sticky$/, function (isClickable: string) {
  const condition: boolean = isClickable.endsWith('not');
  expect(BasePage.isModalVidible(condition), "Modal popup is visible").to.equal(condition);
});

Then(/^modal popup "(.*)" should be opened$/, function (text: string) {
  expect(BasePage.getModal().title).to.equal(text);
});

Then(/^page should contains button "(.*)"$/, function (name: string) {
  expect(BasePage.ifButtonExist(name)).to.equal(true);
});

Given(/^DB: user "(.*)" has (no|few) GR campaigns as "(.*)"$/, async function (userEmail: string, check: string, varName: string) {
  // tslint:disable-next-line:no-shadowed-variable
  const helper = new MySQLHelper();
  const conn: Connection = await helper.getConnection();

  let result;
  let selectQ: string;

  selectQ = conn.format(`SELECT
          *
      FROM
          rm_get_review_capabilities_usages
      WHERE
          customer_id = (SELECT
                  customer_id
              FROM
                  users
              WHERE
                  email = '${userEmail}'
              LIMIT 1)`);

  result = await helper.execute(selectQ, conn);

  if (!result[0][0]) {
    // tslint:disable-next-line:no-console
    console.warn(`No data aviliable in db for test: \n${selectQ}`);
    return Status.PENDING;
  }

  switch (check) {
    case "no":
      // W10= Base64 []
      expect(result[0][0].reports_in_use).to.equal(result[0][0].reports_allowed_to_use);
      break;
    case "few":
      expect(result[0][0].reports_in_use).to.not.equal(result[0][0].reports_allowed_to_use);
      break;
    default:
      throw new Error("Wrong check type for step");
  }

  expect(result[0][0].customer_id).to.satisfy(Number.isInteger);
  this.keepValue(varName, result[0][0]);
});


Then(/^rm credits (not deducted|deducted) from '(.*)'$/, async function (check: string, varName: string) {
  // tslint:disable-next-line:no-shadowed-variable
  const helper = new MySQLHelper();
  const erRowSet = Helper.getWorldValue(varName, this, '%');
  const conn: Connection = await helper.getConnection();

  let result;
  let selectQ: string;

  selectQ = conn.format(`SELECT
          *
      FROM
          rm_get_review_capabilities_usages
      WHERE
          customer_id = ${erRowSet.customer_id}`);

  result = await helper.execute(selectQ, conn);

  // Test if base64 hash changed
  // reports_in_use  - array of reports ids, Base64 encoded

  if (check.startsWith("not")) {
    expect(result[0][0].reports_in_use).to.equal(erRowSet.reports_in_use)
  } else {
    expect(result[0][0].reports_in_use).to.not.equal(erRowSet.reports_in_use);
  }

});

Then(/^total reviews is '(.*)'$/, function (
  reviewsCount: string
) {
  const page = new RMViewReport();
  expect(Helper.replaceWithWorldValue(reviewsCount, this)).to.eql(page.getTotalReviews().replace(",",""));
});

Then(/^report name is '(.*)'$/, function (
  name: string
) {
  const page = new RMViewReport();
  expect(Helper.replaceWithWorldValue(name, this)).to.eql(page.getReportName());
});

Then(/^DB: '(.*)' should contains "(.*)":"(.*)"$/, async function (
  query: string,
  targetField: string,
  expectedResult: string
) {
  // tslint:disable-next-line:no-shadowed-variable
  const helper = new MySQLHelper();
  const conn: Connection = await helper.getConnection();
  let result;
  const cleanUpTable = conn.format(query);
  result = await helper.execute(cleanUpTable, conn);
  expect(result[0][0]).to.haveOwnProperty(targetField);
  expect(result[0][0][`${targetField}`], `DB field doesnt contains '${targetField}':\n${result[0]}`).to.equal(expectedResult);
});

Then(
  /^user (should|should not) receive an email as "(.*)" with$/,
  async function checkEmail(
    ifReceive: string,
    varName: string,
    data: TableDefinition
  ) {

    const params: IGmailFilter = Helper.addTimestamp(Helper.applyRandom(
      data,
      Constants.RANDOM_MARKER,
      this.randomPrefix
    )).hashes()[0];

    const mailClient: GmailClient = new GmailClient(
      params.googleEmail,
      params.googlePassword,
      ['ALL', ['SINCE', Helper.getFormatedDate(Date.now(), 'MMMM D, YYYY')]]
    );
    await mailClient.connect();
    const res = await mailClient.fetchEmails(
      params.title,
      params.waitTimeSec * 1000 || 125000
    );

    if (res) this.keepValue(varName, res);
    // Assert
    if (ifReceive.endsWith('not')) {
      // tslint:disable-next-line:no-unused-expression
      expect(res, `User received email`).to.be.undefined;
    } else {
      expect(
        res,
        `User not received email with title '${params.title}' after ${params.waitTimeSec} seconds`
      ).to.not.equal(undefined);
    }
  }
);

Then(
    /^user (should|should not) receive an email with "(.*)"$/,
    async function checkGmail(
        ifReceive: string,
        varName: string,
        data: TableDefinition
    ) {

      const params: IGmailFilter = Helper.addTimestamp(Helper.applyRandom(
          data,
          Constants.RANDOM_MARKER,
          this.randomPrefix
      )).hashes()[0];

      browser.url("https://accounts.google.com");
      console.log(params.title);
      const gmailClient: GmailLoginPage = new GmailLoginPage();
      gmailClient.login(params.googleEmail,params.googlePassword)
          // .waitForLetterWithSunject(params.title)
          .exitFromGmail();
    }
);

Then(/^(.*) file should be downloaded$/, function (fileType: string) {
  // Wait for file downloaded
  browser.pause(browser.options.waitforTimeout);
  const files = Helper.getDownloadedFiles();
  const filesF = files
    .filter(f => f.name.endsWith(`.${fileType.toLowerCase()}`));
  // assert filetype
  expect(filesF.length, `File not downloaded:\nFile list:\n${files.map(f => `${f.name}:${f.date.toLocaleString()}`)}\n`).to.greaterThan(0);
  // asser creation datetime
  chai.expect(
    filesF
      .sort((o1, o2) => (o1.date.getTime() > o2.date.getTime()) ? -1 : 1)[0].date,
    'File date doesn not match last 5 minustes')
    .to.withinTime(moment().add(-5, 'minute').toDate(), new Date());
});

Then(/^will see the list of fields which match up by "(.*)" with "(.*)"$/, function (colBy: string, filter: string) {
  const ar = Helper.replaceWithWorldValue(filter, this);
  BasePage.waitForLoad();
  browser.pause(500);
  BasePage.getTable({ name: "locator", locator: "table[contains(@class, \'originTable\')]" })
    .forEach(row => {
      chai.expect(row[colBy]).equalIgnoreCase(ar);
    })
});

Then(/^will see the list of fields which contains "(.*)" with "(.*)"$/, function (colBy: string, filter: string) {
  const ar = Helper.replaceWithWorldValue(filter, this);
  BasePage.waitForLoad();
  browser.pause(500);
  const res = BasePage.getTable({ name: "locator", locator: "table[contains(@class, \'originTable\')]" })
    .filter(row => row[colBy] === ar);
  expect(res.length > 0).to.equal(true);
});

Then(
  /^'(.*)' page (should|should not) contains (message|items list) '(.*)'$/,
  function (
    pageName: string,
    ifContains: string,
    isList: string,
    message: string
  ) {
    findText(pageName, ifContains, isList, message);
  }
);

Then(
  /^'(.*)' page (should|should not) contains (message|items list)$/,
  function (pageName: string, ifContains: string, isList: string, message: string) {
    findText(pageName, ifContains, isList, message.replace(/\n/g, ''));
  }
);

Then(
  /^page (should|should not) contains items$/,
  function (ifContains: string, message: string) {
    findText(null, ifContains, 'items list', Helper.replaceWithWorldValue(message, this).replace(/\n/g, ''));
  }
);

Then(
  /^page (should|should not) contains (message|items list) '(.*)'$/,
  function (ifContains: string, isList: string, message: string) {
    const erText = Helper.replaceWithWorldValue(message, this);
    findText(null, ifContains, isList, erText.replace(/\n/g, ''));
  }
);

Then(/^'(.*)' shoud contain image$/, function (txt: string) {
  expect(BasePage.isImageExist(txt));
});

Then(
  /^button with text "(.*)" shold be (disabled|enabled)$/,
  function (txt: string, enabled: string) {
    const condition = enabled.startsWith('enabl');
    expect(BasePage.isEnabled(txt, !condition), `Button with text "${txt}" is not ${enabled}`).to.be.equal(condition);
  }
);

Then(
  /^page should contains (iframe with |)'(.*)' element$/,
  function (ifIframe: string, selector: string) {
    BasePage.ifElementVisible(selector, ifIframe.length > 0);
  }
);

Then(/^fields data should be saved$/, function () {
  const currentValues = BasePage.getInputValues(this.obj);
  expect(currentValues).to.eql(this.obj);
});

Then(/^page (should|should not) contains text '(.*)'$/, function (
  ifContains: string,
  text: string
) {
  const erTxt = Helper.replaceWithWorldRandom(
    Helper.replaceWithWorldValue(text, this, '%'), this);
  const ifCont = !ifContains.endsWith('not');
  browser.pause(1000);
  expect(
    BasePage.ifTextExist(erTxt, ifCont ? 20 : 1),
    `${erTxt} doesnt exist on page`
  ).to.equal(ifCont);
});

Then(/^page (should|should not) contains error text '(.*)'$/, function (
    ifContains: string,
    text: string
) {
  const erTxt = Helper.replaceWithWorldRandom(
      Helper.replaceWithWorldValue(text, this, '%'), this);
  const ifCont = !ifContains.endsWith('not');
  browser.pause(1000);
  expect(
      BasePage.ifErrorTextExist(erTxt, ifCont ? 20 : 1),
      `Text [${erTxt}] doesnt exist on page`
  ).to.equal(ifCont);
});

Then(/^page at new tab (should|should not) contains text '(.*)'$/, function (
    ifContains: string,
    text: string
) {
  const erTxt = Helper.replaceWithWorldRandom(
      Helper.replaceWithWorldValue(text, this, '%'), this);
  const ifCont = !ifContains.endsWith('not');
  browser.switchTab(browser.getWindowHandles()[1]);
  browser.pause(1000);
  // browser.switchTab(browser.getWindowHandles()[1]);
  expect(
      BasePage.ifTextExist(erTxt, ifCont ? 20 : 1),
      `${erTxt} doesnt exist on page`
  ).to.equal(ifCont);
});

Then(/^table with title "(.*)" should contains "(.*)" items$/, function (
  name: string,
  itemsCount: string
) {
  BasePage.waitForLoad();
  browser.pause(1000);
  const table = BasePage.getTable({ name }, [
    { cellHeader: 'Submit', attrName: 'class', elem: 'input' }
  ]);
  expect(table.length).to.equal(
    Number.parseInt(Helper.replaceWithWorldValue(itemsCount, this, '%'), 0)
  );
});

Then(/^"(.*)" (should|should not) be equal to "(.*)"$/, function (ar: string, condition: string, er: string) {
  ar = Helper.replaceWithWorldValue(ar, this);
  er = Helper.replaceWithWorldValue(er, this);
  if (condition.endsWith("not")) {
    expect(ar).to.not.be.equal(er);
  } else {
    expect(ar).to.be.equal(er);
  }
});

Then(/^user should be directed to new tab$/, function () {
  Helper.ifNewTab();
});

Then(/^user should (be|not be) directed to '(.*)' page: "(.*)"$/, function (
  directed: string,
  pageName: string,
  path: string
) {
  const expPage = PageFactory.getPageForName(pageName);
  const expPath = Helper.replaceWithWorldValue(path.replace('?', '\\?'), this);
  expPage.pathId = Helper.getWorldValue(path.replace('?', '\\?'), this);
  if (directed.startsWith('not')) {
    expect(expPath).to.not.equal(
      Helper.getHrefPath(expPage.getURL()),
      `User was directed to another page ${expPage}`
    );
  } else {
    expPage.waitForInit();
    expect(Helper.getHrefPath(BasePage.getPageURL()))
      .to.matches(new RegExp(expPath, 'g'));
    browser.pause(1000);
  }
});

Then(/^user should (be|not be) directed to '(.*)' page$/, function (
  directed: string,
  pageName: string
) {
  const expPage = PageFactory.getPageForName(pageName);
  if (directed.startsWith('not')) {
    expect(expPage.getURL()).to.not.equal(
      Helper.getHrefPath(BasePage.getPageURL()),
      `User was directed to another page ${expPage}`
    );
  } else {
    expPage.waitForInit();
    expect(Helper.getHrefPath(BasePage.getPageURL()))
      .to.matches(new RegExp(expPage.getURL().pathname, 'g'));
  }
});

Then(/^page (.*) is opened$/, function (pageName: string) {
  const expPage = PageFactory.getPageForName(pageName);
  expPage.waitForInit();
});

Then(/^user should (be|not be) directed to: "(.*)"$/, function (
  directed: string,
  path: string
) {
  BasePage.waitForLoad();
  const expPath = Helper.replaceWithWorldValue(path.replace('?', '\\?'), this);
  const currentPath = Helper.getHrefPath(BasePage.getPageURL());
  if (directed.startsWith('not')) {
    expect(expPath).to.not.equal(
      currentPath,
      `User was directed to another page ${BasePage.getPageURL()}`
    );
  } else {
    expect(currentPath).to.matches(new RegExp(expPath, 'g'));
  }
});

Then(/^user should (be|not be) redirected to: "(.*)"$/, function (
    isShould: string,
    expPath: string
) {
  browser.pause(2000);
  const actPath = Helper.getHrefPath(BasePage.getPageURL());
  const id:string = Helper.getNuberFromString(actPath);
  expPath = expPath.replace("{localion_id}",id).replace("\\#","#");
  if (isShould.startsWith('not')) {
    expect(expPath).to.not.equal(actPath,"URL's doesn't mutch as expected");
  } else {
    expect(actPath).to.be.equal(expPath);
  }
});

When(/^user fulfill '(.*)' page form with:$/, function (
  pageName: string,
  data: TableDefinition
) {
  const randomPrefix = Helper.getRandomForString(
    data.raw().join(),
    Constants.RANDOM_MARKER
  );
  const values = Helper.applyRandom(
    data,
    Constants.RANDOM_MARKER,
    randomPrefix
  );
  this.obj = BasePage.addInputValues(values.hashes()[0], true);
});

// Slow test
Then(
  /^user should wait until directed to '(.*)' page: "(.*)"$/,
  { timeout: 1300 * 1000 },
  function (pageName: string, path: string) {
    const expPage = PageFactory.getPageForName(pageName);
    const expPath = Helper.replaceWithWorldValue(
      path.replace('?', '\\?'),
      this
    );
    expPage.pathId = Helper.getWorldValue(path.replace('?', '\\?'), this);
    expPage.waitForInit(90);
    expect(Helper.getHrefPath(BasePage.getPageURL())).to.matches(
      new RegExp(expPath, 'g')
    );
  }
);

Then(/^error message should be shown (.*)$/, function (msg: string) {
  expect(BasePage.getErrorMessages()).to.contain(msg);
});

/**
 * Find text on page
 * Assert if exist or not
 * TODO: Add soft assertion for list
 *
 * @param {string} pageName
 * @param {string} ifContains
 * @param {string} isList
 * @param {string} message
 */
const findText = (
  pageName: string,
  ifContains: string,
  isList: string,
  message: string
): void => {
  if (pageName != null) {
    const expPage = PageFactory.getPageForName(pageName);
    expPage.waitForInit();
    expPage.waitUntilSpinnerEnd();
  }
  const items: string[] = [];
  isList.endsWith('list')
    ? items.push(...message.split(';'))
    : items.push(message);
  let isExist: boolean;
  const pol = !ifContains.endsWith('not');
  const timeout = pol ? 10 : 1;
  items.forEach(i => {
    isExist = BasePage.ifTextExist(i, timeout);
    expect(isExist).that.equal(
      pol,
      `Message with text "${i}" doesn't appeared on ${pageName ||
      'this'} page after ${browser.options.waitforTimeout * timeout} ms`
    );
  });
};
