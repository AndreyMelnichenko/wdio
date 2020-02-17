import { config, expect } from 'chai';
import { TableDefinition, Then, When } from 'cucumber';
import { BasePage } from '../pages/base.page';
import { WidgetSettings } from '../pages/leadGen/widgetSettings.page';
import { Constants } from '../utils/constants';
import { Helper } from '../utils/helper';

const page = new WidgetSettings();
config.truncateThreshold = 0;

When(/^user fillout Widget Settings form with$/, function (
  data: TableDefinition
) {
  const randomPrefix: string = Helper.getRandomForString(
    data.raw().join(),
    Constants.RANDOM_MARKER
  );
  const values: TableDefinition = Helper.applyRandom(
    data,
    Constants.RANDOM_MARKER,
    randomPrefix
  );

  BasePage.addInputValues(values.hashes()[0]);

  // add input data to world store
  for (const key in values.hashes()[0]) {
    if (
      values.hashes()[0].hasOwnProperty(key) &&
      data.hashes()[0].hasOwnProperty(key)
    ) {
      this.keepValue(data.hashes()[0][key], values.hashes()[0][key]);
    }
  }
});

Then(/^open widget html$/, function () {
  const currentValues = BasePage.getInputValues(this.obj);
  expect(currentValues).to.eql(this.obj);
});

When(/^save widget code to file "(.*)"$/, function (varName: string) {
  const value = BasePage.getElementText('#widget-code');
  Helper.createDirIfNotExist(`${process.cwd()}/tmp`);
  const filePath = `${process.cwd()}/tmp/${browser.sessionId.normalize()}_${varName}.html`;
  Helper.createhtmlWithBody(filePath, value);
  this.keepValue(varName, filePath);
});

When(/^user open (file|url) "(.*)"$/, function (
  type: 'file' | 'url',
  path: string
) {
  switch (type) {
    case 'file':
      BasePage.openFile(Helper.replaceWithWorldValue(path, this));
      break;
    case 'url':
      BasePage.openURL(Helper.replaceWithWorldValue(path, this));
      break;
    default:
      break;
  }
  // tslint:disable-next-line:no-console
  console.log(browser.getUrl());
});

When(/^user add widget benefits text '(.*)'$/, function (text: string) {
  const randomPrefix = Helper.getRandomForString(text, Constants.RANDOM_MARKER);
  const value = Helper.replaceWithRandom(
    text,
    Constants.RANDOM_MARKER,
    randomPrefix
  );
  page.addBenefitsText(value);
  this.keepValue(text, value);
});

When(/^user save widget settings$/, function () {
  BasePage.clickOnButton('Save Changes');
  page.waitForSpinner(200, '.wave-wave', false);
  page.waitForReLoad();
});

When(/^user set color of '(.*)' to '(.*)'$/, function (
  field: string,
  color: string
) {
  BasePage.clickOnButton(field);
  page.setHexColor(color);
  browser.moveToObject('body', 0, 0);
});

When(
  /^widget (background|buttonBackground|text|buttonText) color must be '(.*)'$/,
  function (elementType: string, tagetColor: string) {
    expect(page.getHexColor(elementType).toLocaleUpperCase()).to.be.equal(
      tagetColor
    );
  }
);

Then(/^widget should contains text '(.*)'$/, function (txt: string) {
  const target: string = this.findValue(txt);
  page
    .switchToWidget()
    .validateTxt(target)
    .switchBack();
});

Then(/^field '(.*)' must have (value|text|selected|choice|data-value) '(.*)'$/, function (
  fieldName: string,
  type: "value" | "text" | "selected" | "choice" | "data-value",
  targetValue
) {
  targetValue = Helper.replaceWithWorldRandom(Helper.replaceWithWorldValue(targetValue, this), this);
  switch (type) {
    case "text":
      expect(BasePage.getInputText(fieldName)).to.equal(targetValue);
      break;
    case "value":
      expect(BasePage.getInputValue(fieldName)).to.equal(targetValue);
      break;
    case "selected":
      expect(BasePage.getSelectedValue(fieldName)).to.equal(targetValue);
      break;
    case "choice":
      expect(BasePage.getSelectizeChoiceText(fieldName)).to.equal(targetValue);
      break;
    case "data-value":
      expect(BasePage.getInputDataValue(fieldName)).to.equal(targetValue);
      break;
    default:
      throw new Error(`Wron type check for input: ${type}`);
  }
});
