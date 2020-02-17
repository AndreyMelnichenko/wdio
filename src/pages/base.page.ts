import { TableDefinition } from 'cucumber';
import { URL } from 'url';
import { Helper } from "../utils/helper";
import { FacebookLogin } from './3rd-parties/facebook.login.page';
import { GoogleSignIn } from './3rd-parties/google.signin.page';

abstract class BasePage {
  public pageUrl: URL;
  public errorMessages: string;
  public elementLocator: string;
  public spinner?: string;
  public pathId?: number;
  private static dropdownActive: string = '.dropdown-active';
  private static modalPopup = { container: ".SplashModal-modal", close: '.SplashModal-close' };

  /**
   * Connect reportr to 3-rd party accound
   *
   * @static
   * @param {string} accountType
   * @param {TableDefinition} data
   * @returns {*}
   * @memberof BasePage
   */
  public static connectAccount(accountType: string, data: TableDefinition): any {
    switch (accountType) {
      case 'Google':
        new GoogleSignIn().fullfil(data.hashes()[0]);
        break;
      case 'Facebook':
        new FacebookLogin().fullfil(data.hashes()[0]);
        break;
      case 'RCW with Facebook':
      case 'Onboarding with Facebook':
          new FacebookLogin().simpleFulFil(data.hashes()[0]);
        break;
      default:
        throw new Error(`Invalid account type ${accountType}`);
    }
  }

  /**
   * Wait until element is visible, then click on it
   *
   * @static
   * @param {string} buttonTxt
   * @param {string} [element='button']
   * @memberof BasePage
   */
  public static waitForVisibleAndClick(buttonTxt: string, element: string = 'button'): void {
    const elt = `//${element}[text()="${buttonTxt}"]`;
    $(elt).waitForDisplayed(browser.options.waitforTimeout * 30);
    $(elt).click();
  }

  /**
   * Close modal
   *
   * @static
   * @returns {*}
   * @memberof BasePage
   */
  public static closeModal(): any {
    $(this.modalPopup.container).waitForDisplayed();
    $(this.modalPopup.close).click();
  }

  /**
   * Test if model is visible
   *
   * @static
   * @param {boolean} [reverse=false]
   * @returns {boolean}
   * @memberof BasePage
   */
  public static isModalVidible(reverse: boolean = false): boolean {
    try {
      $(this.modalPopup.container).waitForDisplayed(500, reverse);
      return true;
    } catch (error) {
      // tslint:disable-next-line:no-console
      console.error(`Modal not visible: ${error}`);
      return false;
    }
  }

  /**
   * Wait for modal is visible
   * And return title
   *
   * @static
   * @returns {{ title: string }}
   * @memberof BasePage
   */
  public static getModal(): { title: string } {
    const elm = $(this.modalPopup.container);
    elm.waitForDisplayed();
    return { title: $('.SplashModal-title').getText() };
  }


  public static clickOnTab(tabName: string): void {
    const selector = `//*[starts-with(@class,'tab-title')]//a[text()="${tabName}"]`;
    const el = $(selector);
    el.waitForDisplayed();
    el.click();
  }


  public static clickOnInputButton(text: string): void {
    BasePage.clickOnElement(`//*[name()="button" or name()="input"][normalize-space(text())="${text}" or @value="${text}"] | //*[name()="button" or name()="input"]//*[.="${text}"]`);
  };

  public static selectValueFromGreenDD(dropdownTitle: string, value: string): void {
    const elem = $(`//a[text()="${dropdownTitle}"]/following-sibling::button[1]`);
    elem.waitForDisplayed();
    elem.click();
    $('.dropdown-content').waitForDisplayed();
    BasePage.clickOnButton(value);
    $('.dropdown-content').waitForDisplayed(browser.options.waitforTimeout, true);
  }
  /**
   * Move mouse over icon element with text 
   *
   * @static
   * @param {string} text
   * @memberof BasePage
   */
  public static mouseoverOnInfoIcon(text: string): void {
    const element = $(`//*[normalize-space(text())="${text}"]//i`);
    element.moveToObject();
  }

  /**
   * Click on element by locator
   *
   * @static
   * @param {string} locator
   * @returns {*}
   * @memberof BasePage
   */
  public static clickOnElement(locator: string): void {
    const elt = $(locator);
    // wait for render
    elt.waitForDisplayed(browser.options.waitforTimeout);

    // close devbar
    BasePage.closeDevBar();
    BasePage.hideCookieBar();
    elt.click();
  }

  /**
   * Add input value by data-hook locator
   *
   * @static
   * @param {string} hookName
   * @param {string} value
   * @memberof BasePage
   */
  public static addInputByDataHook(hookName: string, value: string, ifEmpty: boolean = false): void {
    const elm = (!ifEmpty) ? $(`[data-hook='${hookName}']`) : $(`[data-hook='${hookName}'][value=""]`);
    elm.waitForDisplayed();
    elm.clearElement();
    elm.addValue(value);
    elm.waitForValue();
  }

  /**
   * Wait for document.readyState === completed
   *
   * @static
   * @returns {*}
   * @memberof BasePage
   */
  public static waitForLoad(): void {
    browser.waitUntil(
      () => browser.execute(() => document.readyState).value === 'complete',
      browser.options.waitforTimeout,
      'Oops, time out!',
      500
    );
  }
  /**
   * Wait until browser tabs will be greater than arg 
   *
   * @static
   * @param {number} arg
   * @returns {*}
   * @memberof BasePage
   */
  public static waitForTab(arg: number): void {
    browser.waitUntil(
      () => {
        return browser.getWindowHandles().length > arg;
      },
      browser.options.waitforTimeout,
      `expected windowHandles > ${arg}`
    );
  }

  /**
   * Swith on target or latest opened tab 
   *
   * @static
   * @param {(number | "latest")} arg0
   * @returns {*}
   * @memberof BasePage
   */
  public static switchTab(arg0: number | "latest"): void {
    const tabs = browser.getWindowHandles();
    browser.pause(300);
    const handle = (arg0 === "latest") ? tabs[tabs.length - 1] : tabs[arg0];
    browser.switchTab(handle);
    browser.pause(300);
  }

  /**
   * Select value from dropdown, based on Selectize api
   *
   * @private
   * @static
   * @param {string} elmLocator
   * @param {string} value
   * @param {number} [waitMultipl=3]
   * @param {boolean} [checkForOptionValue=true]
   * @memberof BasePage
   */
  private static selectSelectizeSelect(
    elmLocator: string,
    value: string,
    waitMultipl: number = 3,
    checkForOptionValue: boolean = true
  ): void {
    this.waitForLoad();
    // split selectize container into seelect and input elements
    const input = $(`${elmLocator}`);
    const select = $(`${elmLocator}/following::select`);

    // scroll to input
    const location: any = $(input.selector);
    input.scroll(location.getLocation().x, location.getLocation().y);
    input.waitForEnabled(browser.options.waitforTimeout * waitMultipl);

    // set vo input

    do {
      location.click();
    } while (!$(this.dropdownActive).isClickable());

    // $(this.dropdownActive).waitForDisplayed(
    //   browser.options.waitforTimeout * waitMultipl
    // );
    input.setValue(value);
    browser.keys(['\uE007']);
    browser.pause(1000);
    $(this.dropdownActive).waitForDisplayed(
      browser.options.waitforTimeout * waitMultipl,
      true
    );

    // wait for value in select element
    if (checkForOptionValue) {
      $(`${select.selector}/option`).waitForValue(
        browser.options.waitforTimeout * waitMultipl
      );
    }
  }

  /**
   * Select value from dropdown rendered with Selectize api
   *
   * @private
   * @static
   * @param {string} elmLocator
   * @param {string} value
   * @param {number} [waitMultipl=3]
   * @param {boolean} value check element
   * @memberof BasePage
   */
  private static useSelectizeSelect(
    elmLocator: string,
    value: string,
    waitMultipl: number = 3,
    checkForOptionValue: boolean = true
  ): void {
    this.waitForLoad();
    // split selectize container into seelect and input elements
    const input = $(`${elmLocator}/following::input`);
    const select = $(`${elmLocator}/following::select`);

    // scroll to input
    const location: any = $(input.selector);
    input.scroll(location.getLocation().x, location.getLocation().y);
    input.waitForEnabled(browser.options.waitforTimeout * waitMultipl);

    // set vo input

    do {
      location.click();
    } while (!$(this.dropdownActive).isClickable());

    // $(this.dropdownActive).waitForDisplayed(
    //   browser.options.waitforTimeout * waitMultipl
    // );
    input.setValue(value);
    browser.keys(['\uE007']);
    browser.pause(1000);
    $(this.dropdownActive).waitForDisplayed(
      browser.options.waitforTimeout * waitMultipl,
      true
    );

    // wait for value in select element
    if (checkForOptionValue) {
      $(`${select.selector}/option`).waitForValue(
        browser.options.waitforTimeout * waitMultipl
      );
    }
  }

  /**
   * Check if element with text enbled
   *
   * @static
   * @param {string} txt
   * @param {boolean} [reverse=false]
   * @returns {boolean}
   * @memberof BasePage
   */
  public static isEnabled(txt: string, reverse: boolean = false): boolean {
    const elm = `//*[normalize-space(text())="${txt}" or @value = "${txt}"]`;
    try {
      $(elm).waitForEnabled(reverse ? 500 : browser.options.waitforTimeout, reverse);
      return true;
    } catch (error) {
      // tslint:disable-next-line:no-console
      console.error(`Element is disabled or not exist: ${error}`);
      return false;
    }
  }

  /**
   * Test if image exist under element with text
   *
   * @static
   * @param {string} txt
   * @returns {boolean}
   * @memberof BasePage
   */
  public static isImageExist(txt: string): boolean {
    return $(`//*[normalize-space(text())="${txt}"]//..//img`).isExisting();
  }

  /**
   * Upload file to element naext after elemet with target text 
   *
   * @static
   * @param {string} field
   * @param {string} path
   * @memberof BasePage
   */
  public static uploadFile(field: string, path: string): void {
    const inputTemplate: string = `//*[normalize-space(text())="${field}"]/input[not(contains(@style,'display: none'))]`;
    $(inputTemplate).chooseFile(path);
  }

  /**
   * Select Value from selectize dropdown
   *
   * @static
   * @param {string} value
   * @param {string} list
   * @param {boolean} [checkForOptionValue=true]
   * @memberof BasePage
   */
  public static useSelectize(
    value: string,
    list: string,
    checkForOptionValue: boolean = true
  ): void {
    const locator = `//*[normalize-space(text())='${list}' or @placeholder='${list}']`;
    BasePage.selectSelectizeSelect(locator, value, 3, checkForOptionValue);
  }

  /**
   * Choose value from dropdown, if it enabled
   *
   * @static
   * @param {string} value
   * @param {string} list
   * @param {boolean} [checkIfEnabled=false]
   * @param {boolean} [checkForOptionValue=true]
   * @memberof BasePage
   */
  public static useSelectizeDropDown(
    value: string,
    list: string,
    checkIfEnabled: boolean = false,
    checkForOptionValue: boolean = true
  ): void {
    const locator = `//*[normalize-space(text())='${list}' or @placeholder='${list}']`;
    if (checkIfEnabled) {
      if (!$(`${locator}/following::select`).isEnabled()) return;
    }
    $(`${locator}/following::select`).waitForEnabled(
      browser.options.waitforTimeout * 4
    );
    BasePage.useSelectizeSelect(locator, value, 3, checkForOptionValue);
  }

  /**
   * Set text value into input/textarea field
   *
   * @static
   * @param {string} value
   * @param {string} inputField
   * @returns {string} inserted value
   * @memberof BasePage
   */
  public static setInputValue(value: string, inputField: string): string {
    const locator = `normalize-space(text())='${inputField}' or @placeholder='${inputField}' or @id='${inputField}'`;
    const input = $(
      `//*[${locator}]/following::input | //input[${locator}] | //textarea[@placeholder="${inputField}"]`
    );
    input.waitForDisplayed();
    browser.scroll(input.selector, 0, 15);
    input.clearElement();
    input.addValue(value);
    return input.getValue();
  }

  /**
   * Get text from input field with data-value attr
   *
   * @static
   * @param {string} list
   * @returns {string}
   * @memberof BasePage
   */
  public static getInputDataValue(list: string): string {
    const input = $(
      `//*[normalize-space(text())='${list}' or @placeholder='${list}']/following::input`
    );
    input.waitForExist();
    const res = $(`${input.selector}//..//*[@data-value]`);
    res.waitForExist();
    return res.getText();
  }

  /**
   * Get value from input field
   *
   * @static
   * @param {string} list
   * @returns {string}
   * @memberof BasePage
   */
  public static getInputValue(list: string): string {
    const input = $(
      `//*[normalize-space(text())='${list}' or @placeholder='${list}']/following::input`
    );
    input.waitForExist();
    return input.getValue();
  }

  /**
   * Get selected text from option field
   *
   * @static
   * @param {string} list
   * @returns {string}
   * @memberof BasePage
   */
  public static getSelectedValue(list: string): string {
    const input = $(
      `//*[normalize-space(text())='${list}' or @placeholder='${list}']/following::select/option[@selected]`
    );
    input.waitForExist();
    return input.getText();
  }

  /**
   * Get text from selectize dropdown
   *
   * @static
   * @param {string} list
   * @returns {string}
   * @memberof BasePage
   */
  public static getSelectizeChoiceText(list: string): string {
    const input = $(
      `//*[normalize-space(text())='${list}' or @placeholder='${list}']/following::div[@class="item" and@data-value]`
    );
    input.waitForExist();
    return input.getText();
  }
  /**
   * Get text from input element 
   *
   * @static
   * @param {string} list
   * @returns {string}
   * @memberof BasePage
   */
  public static getInputText(list: string): string {
    const input = $(
      `//*[normalize-space(text())='${list}' or @placeholder='${list}']/following::input`
    );
    input.waitForExist();
    return input.getText();
  }
  /**
   * Get text from element by locator
   *
   * @static
   * @param {string} elmLocator
   * @returns {string}
   * @memberof BasePage
   */
  public static getElementText(elmLocator: string): string {
    return $(elmLocator).getText();
  }

  public static waitForReact() {
    browser.waitForExist('div[data-reactroot]');
    return this;
  }

  /**
   * click on element
   * and validate that text appeared
   *
   * @static
   * @param {string} toggleText clickable element title
   * @param {string} [expectedText] wait for exist
   *
   */
  public static clickAndValidate(toggleText: string, expectedText?: string) {
    this.clickOnButton(toggleText, true);
    if (expectedText) this.ifTextExist(expectedText);
  }

  /**
   * Click on button, if it visible
   *
   * @static
   * @param {string} text
   * @param {boolean} [wait=false]
   * @returns
   * @memberof BasePage
   */
  public static clickOnVisibleButton(
    text: string,
    wait: boolean = false
  ) {
    const locator = `//*[normalize-space(text())="${text}" or @value="${text
      .split(' ')
      .map(x => x.charAt(0).concat(x.slice(1).toLowerCase()))
      .join(' ')}" or @data-hook="${text}" or @class="${text}" or @href="${text}"]`;

    // find element
    const elem = $$(locator);

    // wait for render
    if (wait) {
      elem[0].waitForEnabled(browser.options.waitforTimeout * 10);
    } else {
      elem[0].waitForDisplayed(browser.options.waitforTimeout);
    }

    // close devbar
    BasePage.closeDevBar();
    BasePage.hideCookieBar();

    try {
      browser.pause(500);
      $$(locator).find(x => x.isClickable()).click();
    } catch (error) {
      throw new Error(
        `Unable to locate element with text "${text}" by locator "${elem}"\n{${error}}`
      );
    }
    return this;
  }

  /**
   * Find and click on elemnt by text
   * use altText for find alternative
   *
   * @static
   * @param {string} text
   * @param {string} [altText]
   * @returns
   * @memberof BasePage
   */
  public static clickOnButton(
    text: string,
    wait: boolean = false
  ) {

    // find element
    const locator = `//*[name()="input" or name()="button" or name()="a" or name()="div" or name()="label" or name()="li" or name()="span"][normalize-space(text())="${text}" or @value="${text
      .split(' ')
      .map(x => x.charAt(0).concat(x.slice(1).toLowerCase()))
      .join(' ')}" or @data-hook="${text}" or @class="${text}" or @href="${text}" or @data-ref="${text}"]`;
    const elem = $(locator);

    // wait for render
    if (wait) {
      elem.waitForEnabled(browser.options.waitforTimeout * 10);
    } else {
      elem.waitForDisplayed(browser.options.waitforTimeout * 10);
    }

    // close devbar
    BasePage.closeDevBar();
    BasePage.hideCookieBar();


    try {
      browser.scroll(locator);
      $(locator).click();
    } catch (error) {
      throw new Error(
        `Unable to locate element with text "${text}" by locator "${locator}"\n{${error}}`
      );
    }
    return this;
  }

  /**
   * Close Cookie info bar, if visible
   *
   * @static
   * @returns {*}
   * @memberof BasePage
   */
  public static hideCookieBar(): any {
    const cookieSelector:string="//a[@class='hide-btn btn btn-small']";
    const el = $(cookieSelector);
    browser.pause(1000);
    if (el.isClickable()) {
      // browser.execute((locator) => {
      //   document.querySelector(locator).remove();
      // }, "#bl-cookie-bar");
      el.click();
    }
  }

  /**
   * Close yellow dev-bar if visible
   *
   *
   * @static
   * @returns {*}
   * @memberof BasePage
   */
  public static closeDevBar(): any {
    browser.pause(1000);
    try {
      const el = $('#devBarClose');
      if (el.isClickable()) {
        el.click();
        el.waitForDisplayed(browser.options.waitforTimeout, true);
      }
    } catch (error) {
      // tslint:disable-next-line:no-console
      console.warn('Unable to close devbar');
    }
  }

  /**
   * Click on button by text and href attribute
   *
   * @static
   * @param {string} text
   * @param {string} href
   * @memberof BasePage
   */
  public static clickOnButtonHref(text: string, href: string) {
    browser.click(
      `//*[normalize-space(@href)="${href}" and normalize-space(text())="${text}"]`
    );
  }

  /**
   * Test if text visible
   *
   * @static
   * @param {string} txt
   * @returns
   * @memberof BasePage
   */
  public static ifTextVisible(txt: string) {
    const target: string = txt.replace('\n', '');
    const locator: string = `//*[contains(normalize-space(text()),"${target}")] | //*[@value="${target}"]`;
    return $(locator).isClickable();
  }

  /**
   * Test if text exist on page
   *
   * @static
   * @param {string} txt
   * @param {number} [multipl=10]
   * @returns {boolean}
   * @memberof BasePage
   */
  public static ifTextExist(txt: string, multipl: number = 10): boolean {
    const target: string = txt.replace('\n', '');
    const locator: string = `//*[contains(normalize-space(text()),"${target}")] | //*[text()="${target}"] | //*[@value="${target}"]`;
    try {
      return $(locator).waitForDisplayed(
        browser.options.waitforTimeout * multipl
      );
    } catch (error) {
      // tslint:disable-next-line:no-console
      console.error(
        `Negative scenario check:\nTrying to find text with: ${locator}`,
        error
      );
      return false;
    }
  }

  /**
   * Test if RERROR text exist on page
   *
   * @static
   * @param {string} txt
   * @param {number} [multipl=10]
   * @returns {boolean}
   * @memberof BasePage
   */
  public static ifErrorTextExist(txt: string, multipl: number = 10): boolean {
    const target: string = txt.replace('\n', '');
    let locator: string = "" +
        "//*[@class='error ']/*[contains(normalize-space(text()),'%s')] | " +
        "//*[@class='error ']/*[text()='%s'] | " +
        "//*[@class='error ']/*[@value='%s'] | " +
        "//*[contains(normalize-space(text()),'%s') and contains(@class,'error') or contains(@class,'warning')]";
    locator = Helper.getMultiReplacebyValue(locator,"%s",target);
    try {
      return $(locator).waitForDisplayed(
          browser.options.waitforTimeout * multipl
      );
    } catch (error) {
      // tslint:disable-next-line:no-console
      console.error(
          `Negative scenario check:\nTrying to find text with: ${locator}`,
          error
      );
      return false;
    }
  }

  /**
   * Test if button exist with text
   *
   * @static
   * @param {string} txt
   * @param {number} [multipl=10]
   * @returns {boolean}
   * @memberof BasePage
   */
  public static ifButtonExist(txt: string, multipl: number = 10): boolean {
    const target: string = txt.replace('\n', '');
    const locator: string = `//button[contains(normalize-space(text()),"${target}")] | //button[@value="${target}"]`;
    let result: boolean = false;
    try {
      result = $(locator).waitForDisplayed(
        browser.options.waitforTimeout * multipl
      );
    } catch (error) {
      // tslint:disable-next-line:no-console
      console.error(
        `Negative scenario check:\nTrying to find button with text: ${locator}`,
        error
      );
    }
    return result;
  }

  /**
   * Get current page URL
   *
   * @static
   * @returns {URL}
   * @memberof BasePage
   */
  public static getPageURL(): URL {
    return new URL(browser.getUrl());
  }

  /**
   * Oen full URL in browser
   *
   * @static
   * @param {string} url
   * @returns {*}
   * @memberof BasePage
   */
  public static openURL(url: string): any {
    browser.url(url);
  }

  /**
   * Do unfocus fromelement, by click on another area
   *
   * @static
   * @returns {*}
   * @memberof BasePage
   */
  public static unfocus(): any {
    browser.leftClick('body', 500, 0);
    browser.pause(500);
  }

  /**
   * Open file in browser
   *
   * @static
   * @param {string} url
   * @returns {*}
   * @memberof BasePage
   */
  public static openFile(url: string): void {
    browser.url(`file://${url}`);
  }

  /**
   * Open path related to BASE_URL
   *
   * @static
   * @param {string} path
   * @returns {*}
   * @memberof BasePage
   */
  public static openPath(path: string, escape: boolean = true): void {
    browser.url(escape ? path.replace('/', '') : path);
  }

  /**
   * Get field name by text
   *
   * @static
   * @param {string} elmTxt
   * @returns {string}
   * @memberof BasePage
   */
  public static getFieldValue(elmTxt: string): string {
    return $(`//*[normalize-space(text())="${elmTxt}"]/*[1]`)
      .getText();
  }

  /**
   * Get fiers input field value after element with text
   *
   * @static
   * @param {string} inputLabelTxt
   * @returns {string}
   * @memberof BasePage
   */
  public static getInputFieldValue(inputLabelTxt: string): string {
    const elt = $(
      `//*[normalize-space(text())='${inputLabelTxt}']/following::input[1]`
    );
    return elt.getValue();
  }
  /**
   * Map HTML table to JSON
   * @param withTable table header text
   * @param mappingConf Array
   * @param cellHeader Header to map
   * @param attrName html attribute
   * @param elem element ref itself
   */
  public static getTable(
    withTable: { name: string, locator?: string },
    mappingConf?: Array<{ cellHeader: string; attrName: string; elem: string }>,
    tableXpathPosition: 'following' | 'preceding' = 'following'
  ): object[] {
    browser.scroll(0, 0);
    browser.pause(1000);
    $('.spinner').waitForDisplayed(browser.options.waitforTimeout, true);
    const table = $$(
      `//*[(starts-with(text(),\"${withTable.name}\"))]/${tableXpathPosition}::table | //${withTable.locator}`
    ).find(t => t.isClickable());
    try {
      table.waitForDisplayed();
    } catch (error) {
      // tslint:disable-next-line:no-console
      console.warn(`Table doesnt exist on page:\n${error}`);
      return [];
    }

    // browser.scroll(table.selector, 0, 200);
    const rows: object[] = [];
    const headersText: string[] = [];
    const headers = table.$$('th');
    table.$$('tbody tr').forEach((tr, index) => {
      const cells = tr.$$('td');
      rows[index] = {};
      cells.forEach((el, cellIndex) => {
        // header
        if (headersText[cellIndex] === undefined) {
          headersText[cellIndex] = headers[cellIndex]
            ? headers[cellIndex].getText()
            : `Cell-${cellIndex}`;
          // || `Cell${[cellIndex]}`;
        }
        // values
        if (mappingConf) {
          mappingConf.forEach(conf => {
            if (headersText[cellIndex] === conf.cellHeader) {
              rows[index][headersText[cellIndex]] = {
                class: tr.getAttribute(conf.attrName),
                location: el.$(conf.elem)
              };
            } else {
              rows[index][headersText[cellIndex]] = el.getText();
            }
          });
        } else {
          rows[index][headersText[cellIndex]] = el.getText();
        }
      });
    });
    return rows;
  }

  /**
   * Click on checbox input with text or name 
   *
   * @static
   * @param {string} chBoxText
   * @returns {*}
   * @memberof BasePage
   */
  public static clickChBoxIput(chBoxText: string, wait: number = 0): any {
    const chBoxEl = $(this.getCheckboxSelector(chBoxText));
    browser.pause(wait);
    chBoxEl.waitForDisplayed();
    chBoxEl.click();
  }

  /**
   * Press ArrowDown key N times
   *
   * @static
   * @param {number} [n=1]
   * @returns {*}
   * @memberof BasePage
   */
  public static scrollDown(n: number = 1): any {
    for (let index = 0; index < n; index++) {
      browser.keys('ArrowDown');
    }
  }

  /**
   * Press ArrowDown key N times
   *
   * @static
   * @param {number} [n=1]
   * @returns {*}
   * @memberof BasePage
   */
  public static scrollPageDown(n: number = 1): any {
    for (let index = 0; index < n; index++) {
      browser.pause(100);
      browser.keys('PageDown');
    }
  }

  /**
   * Get of checkbox input element by text name
   *
   * @static
   * @param {string} chBoxText
   * @returns {boolean}
   * @memberof BasePage
   */
  public static getCheckboxState(chBoxText: string): boolean {
    return $(this.getCheckboxSelector(chBoxText)).isSelected();
  }

  /**
   * Choose value from Option element
   *
   * @static
   * @param {string} value
   * @param {string} textOrAttr
   * @memberof BasePage
   */
  public static selectOption(value: string, textOrAttr: string): void {
    $(
      `//*[text()='${textOrAttr}']/following::select | //select[@name='${textOrAttr}']`
    ).selectByVisibleText(value);
  }

  /**
   * Scroll to target element by codinates 
   *
   * @static
   * @param {*} element
   * @memberof BasePage
   */
  public static scrollClick(element): void {
    const location = element.getLocation();
    element.scroll(location.x, location.y);
    element.click();
  }

  /**
   * Test if element visible by locator,
   * set iframe to true to to find in iframe 
   *
   * @static
   * @param {string} locator
   * @param {boolean} [iframe=false]
   * @returns {boolean}
   * @memberof BasePage
   */
  public static ifElementVisible(
    locator: string,
    iframe: boolean = false
  ): boolean {
    if (iframe) {
      const el = $('iframe[width]');
      el.waitForExist();
      browser.frame(el.value);
    }
    return $(locator).isClickable();
  }

  /**
   * Close all previosly opened tabs,
   * clean cookies,
   * reload current browser
   *
   * @static
   * @memberof BasePage
   */
  public static closeOpenedTabs(clear: boolean): void {
    if (browser.getWindowHandles().length > 1) {
      const tabs = browser.getWindowHandles();
      let first = true;
      const currentTab = browser.getCurrentTabId();
      browser.getWindowHandles().forEach(tab => {
        if (first) {
          browser.switchTab();
          first = false;
        }
        if (tab !== currentTab) browser.close(tabs[tabs.indexOf(tab) + 1]);
      });
    }
    if (clear) {
      browser.deleteCookie();
      browser.reload();
    }
  }

  /**
   * Clise opened tab by index
   *
   * @static
   * @param {number} index
   * @memberof BasePage
   */
  public static closeSideOpenedTab(index: number): void {
    if (browser.getWindowHandles().length > 1) {
      const tabs = browser.getWindowHandles();
      browser.switchTab(tabs[index]);
      const currentTab = browser.getCurrentTabId();
      browser.getWindowHandles().forEach(tab => {
        browser.switchTab(tab);
        if (tab !== currentTab) browser.close(tabs[tabs.indexOf(tab) + 1]);
      });
    }
  }

  /**
   * Submit for by click on text button of use submitForm 
   *
   * @static
   * @param {string} [text]
   * @memberof BasePage
   */
  public static submitForm(text?: string): void {
    if (text) {
      BasePage.clickOnButton(text);
    } else {
      $('form').submitForm();
    }
  }
  /**
   * Mark checkbox elements as checked in table
   *
   * @static
   * @memberof BasePage
   */
  public static selectElementsFromTable = (
    num: number,
    column: string,
    name: string
  ): void => {
    const targetCell: string = column;
    const table = BasePage.getTable({ name }, [
      { cellHeader: targetCell, attrName: 'class', elem: 'input' }
    ]);
    let index = 0;
    const submitedMap = table.map(r => r[targetCell]);

    // uncheckAll
    submitedMap
      .filter(x => x.class !== '')
      .forEach(element => {
        BasePage.scrollClick(element.location);
      });

    // check required count
    submitedMap.forEach(element => {
      if (index < num) {
        BasePage.scrollClick(element.location);
        index++;
      }
    });
  };

  /**
   * Clicks on a following-sibling by text
   *
   * @static
   * @param {string} blockHeader any block text
   * @param {string} linkText a text
   * @returns {*}
   * @memberof BasePage
   */
  public static clickOnButtonSibling(
    blockHeader: string,
    linkText: string
  ): any {
    $(
      `//*[text()='${blockHeader}']/following-sibling::a[text()='${linkText}']`
    ).click();
  }

  /**
   * Add input values to fieds by TableDefinition like dataset
   * @see TableDefinition
   * @static
   * @param {{ [colName: string]: string }} data
   * @param {boolean} [collect]
   * @param {boolean} [waitForValue=true]
   * @returns {{ [colName: string]: string }}
   * @memberof BasePage
   */
  public static addInputValues(
    data: { [colName: string]: string },
    collect?: boolean,
    waitForValue: boolean = true
  ): { [colName: string]: string } {
    const res: { [colName: string]: string } = {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const element = this.findInputField(key);
        try {
          element.waitForEnabled();
          element.clearElement();
          element.waitForValue(browser.options.waitforTimeout, true);
          element.setValue(data[key]);
          if (waitForValue) element.waitForValue();
          if (collect) {
            browser.pause(300);
            res[key] = element.getValue();
          }
        } catch (error) {
          // tslint:disable-next-line:no-console
          console.log(
            `Element is not currently interactable: ${
            element.selector
            }\n${error}`
          );
          res[key] = null;
        }
      }
    }
    return res;
  }
  /**
   * Get input values from fieds by TableDefinition like dataset
   * 
   * @static
   * @see TableDefinition
   * @param {{
   *     [colName: string]: string;
   *   }} data
   * @returns {{ [colName: string]: string }}
   * @memberof BasePage
   */
  public static getInputValues(data: {
    [colName: string]: string;
  }): { [colName: string]: string } {
    const res: { [colName: string]: string } = {};
    let element;
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        element = this.findInputField(key);
        res[key] = element.getValue();
      }
    }
    return res;
  }

  /**
   * Get all visible error messages on page 
   *
   * @static
   * @param {string} [locator='[class$="error"]']
   * @returns {string[]}
   * @memberof BasePage
   */
  public static getErrorMessages(locator: string = '[class$="error"]'): string[] {
    $(locator).waitForDisplayed();
    const els = $$(locator);
    return els.map(el => el.getText());
  }

  // Instance

  /**
   * Click enter and wait a bit
   *
   * @memberof BasePage
   */
  public clickEnter() {
    browser.keys(['\uE007']);
    browser.pause(300);
  }

  public getURL(): URL {
    return this.pageUrl;
  }

  public setLocator(locator: string) {
    this.elementLocator = locator;
    return this;
  }

  public waitUntilSpinnerEnd(spinner: string = '.spinner') {
    const locator = this.spinner || spinner;
    $(locator).waitForDisplayed(browser.options.waitforTimeout * 20, true);
    browser.pause(1000);
    return this;
  }

  public waitForSpinner(
    multipl: number = 25,
    selector?: string,
    waitForExist: boolean = true
  ) {
    const spinerEl = selector || this.spinner;
    if (waitForExist) {
      $(spinerEl).waitForDisplayed(browser.options.waitforTimeout);
    }
    $(spinerEl).waitForDisplayed(browser.options.waitforTimeout * multipl,true);
    return this;
  }

  public getSpinnerText(spinnerLocator: string): string[] {
    $(spinnerLocator).waitForDisplayed(browser.options.waitforTimeout * 20);
    const elms = $$(spinnerLocator);
    if (elms.length > 0) {
      elms[0].waitForDisplayed();
    } else {
      throw new Error(
        `Spinner element not found for locator ${spinnerLocator}`
      );
    }
    return elms.map(el => el.getText());
  }

  public waitForLoad(waitMultipl: number = 20) {
    console.log("wait for page loader before wait");
    browser.pause(2000);
    $(this.elementLocator).waitForDisplayed(browser.options.waitforTimeout * waitMultipl);
    console.log("wait for page loader after wait");
    // BasePage.closeDevBar();
    // BasePage.hideCookieBar();
    return this;
  }

  public waitForReLoad(waitMultipl: number = 10) {
    $(this.elementLocator).waitForDisplayed(browser.options.waitforTimeout * waitMultipl);
    return this;
  }

  public getErrorMessages(): string[] {
    this.waitForInit();
    const errors = $$(this.errorMessages);
    return errors.map(el => el.getText());
  }

  /**
   * Wait for target page loading
   *
   * @param {number} [multipl=10]
   * @memberof BasePage
   */
  public waitForInit(multipl: number = 10) {
    const timeout = multipl * browser.options.waitforTimeout;
    const matcher: RegExp = new RegExp(
      this.getURL().pathname.includes('undefined')
        ? this.getURL().pathname.replace('undefined', '\\w+')
        : this.getURL().pathname,
      'g'
    );

    // 1-st check: 
    // Wait for url matching
    browser.waitUntil(
      () => {
        const currentPath = new URL(browser.getUrl()).pathname;
        return currentPath.match(matcher) != null;
      },
      timeout,
      `Expected to page loads after ${timeout}ms\nExpected path (regexp): ${matcher}\nActual path: ${browser.getUrl()}`
    );

    // 2-nd check:
    // Wailt for element existing 
    browser.waitUntil(
      () => $(this.elementLocator).isExisting(),
      timeout,
      `Expected to elemnt present on page after ${timeout}ms\nExpected locator: ${
      this.elementLocator
      }`
    );
  };

  /**
   * Upen Base URL + path
   * Close system dev bars
   *
   * @param {string} [path]
   * @returns
   * @memberof BasePage
   */
  public open(
    path?: string,
    callback: () => void = () => () => { BasePage.closeDevBar(); BasePage.hideCookieBar() }): this {
    this.pageUrl = path
      ? new URL(browser.options.baseUrl + path)
      : new URL(browser.options.baseUrl);
    const expPage = this.pageUrl.href;
    console.log("Actual page: "+browser.getUrl()+"\nRequired page: "+expPage);
    browser.url(expPage);
    let i = 0;
    do{
      browser.pause(500);
      console.log(i+" : "+browser.getUrl()+" === "+ expPage);
      i++;
    } while ((expPage !== browser.getUrl()) && (i < 6));
    if(expPage !== browser.getUrl()){
      console.log("Рage "+expPage + " NOT loaded!");
      browser.url(expPage);
      browser.pause(3000);
      console.log("Final load, actual page: "+browser.getUrl());
    }else {
      console.log("Рage "+expPage + " loaded!");
    }
    callback();
    return this;
  }

  /**
   * Validate that element with text visible on page
   *
   * @param {string} txt
   * @returns {this}
   * @memberof BasePage
   */
  public validateTxt(txt: string): this {
    $(
      `//*[contains(normalize-space(text()),"${txt}")] | //*[@value="${txt}"]`
    ).waitForDisplayed(browser.options.waitforTimeout * 20);
    return this;
  }

  // Private:
  private static getCheckboxSelector(txt: string): string {
    return `(//*[text()="${txt}"]//../input) | (//input[@name="${txt}" or @value="${txt}"]) | (//*[text()="${txt}"]/following::input) | (//*[contains(@class, "${txt}")]/input)`;
  }

  private static findInputField(key: string) {
    return $(
      `//*[@data-hook="${key}"]//*[@data-hook="input" or @data-hook="textarea" or name()="textarea" or name()="input"] | //*[name()="input" or name()="textarea"][@data-hook="${key}"] | //*[@name="${key}" or value="${key}"] | //*[normalize-space(text())="${key}"]/following::input | //label[@for="${key}"]//following::input[@data-hook="input" or @data-hook="textarea" or name()="textarea" or name()="input"]`
    );
  }
}

export { BasePage };
