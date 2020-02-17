import { expect } from 'chai';
import { Given, Status, TableDefinition, Then, When } from 'cucumber';
import { Connection } from 'mysql2/promise';
import { MySQLHelper } from '../db/mysqlHelper';
import { BasePage } from '../pages/base.page';
import { MonitorReviews } from '../pages/reputationManager/monitorReviews.page';
import { Constants } from '../utils/constants';
import { Helper } from '../utils/helper';
import { GetReviews } from './../pages/reputationManager/getReviews.page';


When(/^user filter reviews by "(.*)"$/, function (name: string) {
  const page = new MonitorReviews();
  BasePage.clickOnButton('Reset');
  page.waitUntilSpinnerEnd();
  BasePage.clickOnButton("All Sources");
  while (BasePage.getCheckboxState('Toggle All')) {
    BasePage.clickChBoxIput('Toggle All');
  }
  BasePage.clickOnInputButton(name.toLowerCase());
  BasePage.unfocus();
});

/**
 * step for delete all rm_kiosk_campaigns for user
 * DELETE /seo-tools/admin/rm/reports/${report.id}/kiosk/campaigns/${campaign.id}
 */
Given(/^user '(.*)' delete all existing (rm_kiosk_campaigns|rm_web_campaigns)$/, async function (
  clientEmail: string,
  tableName: string
) {
  // DB: check if user have ciosk campaigns
  //
  const helper = new MySQLHelper();
  const conn: Connection = await helper.getConnection();
  const sql = conn.format(
    `SELECT * FROM ${tableName}
      WHERE
      customer_id = (SELECT customer_id
        FROM
            users
        WHERE
            email = '${clientEmail}'
        LIMIT 1)`
  );
  const result: any[] = await helper.execute(sql, conn);
  const apiPath = tableName.replace('rm_', '').replace('_campaigns', '');

  // assert for user
  if (result[0].length > 0) {
    // map to array of Promises
    const fetchRes = result[0].map(x =>
      // tslint:disable-next-line:no-return-await
      browser.executeAsync((i, path, done) => {
        fetch(
          `/seo-tools/admin/rm/reports/${i.report_id}/${path}/campaigns/${i.id}`,
          { method: 'DELETE' }
        ).then(r => done(r));
      }, x, apiPath)
    );

    // Resolve promisses
    const resAll = await Promise.all(fetchRes);
    browser.refresh();
    if (this.getPage()) {
      this.getPage().waitForLoad();
    } else {
      BasePage.waitForLoad();
    }
  }
});

Then(/^if value exist "(.*)"$/, function (varName: string) {
  //
  const res = Helper.replaceWithWorldValue(varName, this);
  if (res === res) {
    return Status.PASSED;
  }
});

Then(/^if "(true|false)"$/, function (varName: string) {
  if (!JSON.parse(varName)) {
    return Status.PASSED;
  }
});

Then(/^if "(true|false) click on '(.*)'"$/, function (
  varName: string,
  bName: string
) {
  if (!JSON.parse(varName)) {
    return Status.PASSED;
  }
  BasePage.clickOnButton(bName);
});


When(/^choose '(.*)' (first|new) site in Top Sources from list Review site$/, function (siteName: string, isFirst: string) {
  switch (isFirst) {
    case "first":
      BasePage.useSelectizeDropDown(siteName, 'Review site:');
      BasePage.addInputByDataHook('profileUrlField', `https://${siteName.toLowerCase()}.com/test`);
      break;
    case "new":
      const page: GetReviews = new GetReviews();
      page.addNewReviewSite(siteName, `https://${siteName.toLowerCase()}.com/test`);
      break;
    default:
      throw new Error(`Wrong state ${isFirst}`);
  }
});


When(/^save "(.*)" to HTML file "(.*)"$/, function (
  source: string,
  varName: string
) {
  const content = Helper.replaceWithWorldValue(source, this);
  expect(content).not.equal(undefined);
  Helper.createDirIfNotExist(`${process.cwd()}/tmp`);
  const filePath = `${process.cwd()}/tmp/${browser.sessionId.normalize()}_${varName}.html`;

  Helper.createhtmlWithBody(filePath, content);
  this.keepValue(varName, filePath);
});

When(/^user upload file into "(.*)":$/, function (
  field: string,
  data: TableDefinition
) {
  BasePage.uploadFile(field, data.hashes()[0].path);
});

When(
  /^select all available elements "(.*)" from table with title "(.*)"$/,
  function (column: string, tableName: string) {
    return BasePage.selectElementsFromTable(20, column, tableName);
  }
);

When(/^select (\d+) elements "(.*)" from table with title "(.*)"$/, function (
  num: number,
  column: string,
  tableName: string
) {
  return BasePage.selectElementsFromTable(num, column, tableName);
});

When(/^user clicks '(.*)' on '(.*)' row '(.*)' from table "(.*)"$/, function (
  btnText: string,
  cellName: string,
  rowFilter: string,
  name: string
) {
  const table: any[] = BasePage.getTable({ name }, [
    { cellHeader: cellName, attrName: '', elem: 'span' },
    {
      cellHeader: '',
      attrName: 'text',
      elem: 'a'
    }
  ]);
  table
    .filter(x => x[cellName] === rowFilter)
    .forEach(element => {
      BasePage.scrollClick(element[''].location);
    });
});

When(/^user clicks '(.*)' under '(.*)'$/, function (
  linkText: string,
  blockHeader: string
) {
  BasePage.clickOnButtonSibling(blockHeader, linkText);
});

When(/^wants to (?:.*) by clicking on:$/, function (data: TableDefinition) {
  data.hashes().forEach(x => {
    BasePage.clickOnButton(x.text);
  });
});

When(/^user submits a form "(.*)"$/, function (button: string) {
  BasePage.submitForm(button);
});

When(/^user fulfill (?:.*) form with$/, function (data: TableDefinition) {
  const randomPrefix = Helper.getRandomForString(data.raw().join());
  this.setRandom(randomPrefix);
  const values = Helper.applyRandom(
    data,
    Constants.RANDOM_MARKER,
    randomPrefix
  );
  this.obj = BasePage.addInputValues(values.hashes()[0], true);
});

When(/^user submit (?:.*) form$/, function () {
  BasePage.submitForm();
});
