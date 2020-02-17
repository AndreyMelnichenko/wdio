import {expect} from "chai";
import { TableDefinition } from 'cucumber';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
// @ts-ignore
import { moment } from 'moment';
// @ts-ignore
import * as randomstring from 'randomstring';
import * as URL from "url";
import { CustomWorld } from '../models/CustomWorld';
import { World } from '../models/World';
import {IRcwLocation} from "../pages/rcw/IRcwLocation";
import {IOverviewInfo} from "../pages/reputationManager/overview.page";
import { Constants } from './constants';

abstract class Helper {

  /**
   * Get list of downoaded files form default download dir
   *
   * @static
   * @returns {Array<{ name: string, date: Date }>}
   * @memberof Helper
   */
  public static getDownloadedFiles(): Array<{ name: string, date: Date }> {
    // tslint:disable-next-line:no-string-literal
    const dir = `${browser.options['downloadDir']}/`;
    return readdirSync(dir)
      .map(function (v) {
        return {
          name: v,
          time: statSync(dir + v).mtime.getTime()
        };
      })
      .map(function (v) { return { name: v.name, date: new Date(v.time) } });
  }

  /**
   * Detect if user was directed to new tab
   *
   * @static
   * @memberof Helper
   */
  public static ifNewTab(): void {
    browser.waitUntil(
      () => {
        return browser.getWindowHandles().length > 1},
      browser.options.waitforTimeout,
      'expected windowHandles > 1'
    );
    browser.pause(browser.options.waitforTimeout);
    browser.switchToWindow(browser.getWindowHandles()[1]);
  }

  public static createhtmlWithBody(path: string, bodyContent: string): void {
    //
    const content = `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="X-UA-Compatible" content="ie=edge"/>
          <title>Document </title>
        </head>
        <body>
          ${bodyContent}
        </body>
        </html>`;
    writeFileSync(path, content);
  }

  public static getCurrentMonthFormated(
    momentFormat: string = 'YYYY-MM'
  ): string {
    return moment().format(momentFormat);
  }

  public static getFormatedDate(timestamp: number = Date.now(), format: string = "MMM Do YY"): string {
    return moment(timestamp).format(format);
  }

  public static createDirIfNotExist(path: string): void {
    if (!existsSync(path)) {
      mkdirSync(path);
    }
  }

  public static addTimestamp(
    data: TableDefinition,
    marker: string = "TIME",
    time: number = Date.now()
  ): TableDefinition {
    return Helper.transform(data, marker, time, Helper.replaceWithTime);
  }

  private static transform(data: TableDefinition, marker: string, value: any, apply: (target: string, marker: string, value: any) => any): TableDefinition {
    const newData: TableDefinition = Object.create(data);
    const raw = newData
      .raw()
      .map(x =>
        x.map(y =>
          y.includes(marker)
            ? apply(y, marker, value)
            : y
        )
      );
    newData.raw = () => raw;
    return newData;
  }


  public static replaceWithTime(data: string, marker: string, time: number): string {
    return data.replace(new RegExp(marker, 'g'), time.toString() || Date.now().toString());
  }

  public static applyRandom(
    data: TableDefinition,
    marker: string,
    prefix: string,
  ): TableDefinition {
    return Helper.transform(data, marker, prefix, Helper.replaceWithRandom);
  }

  public static getHrefPath(url: URL): string {
    return url.href.replace(url.origin, '');
  }

  public static getRandomForString(
      data: string,
      randomMarker: string = 'RANDOM',
      charset?: string
  ): string {
    return data.includes(randomMarker)
        ? randomstring.generate({ length: 7, charset: charset || 'alphabetic' })
        : '';
  }

  public static getMultiRandomForString(
    data: string,
    randomMarker: string = 'RANDOM',
    charset?: string,
    randomLenght?:string
  ): string {
    const count = (str) => {
      const re = new RegExp(randomMarker, "g");
      return ((str || '').match(re) || []).length;
    };
    const counter = count(data);
    for (let i = 0; i < counter; i++) {
      data = data.replace("RANDOM", randomstring.generate({ length: randomLenght || 7, charset: charset || 'alphabetic' }));
    }

    return data;
  }

  public static getMultiReplacebyValue(
      inputString: string,
      subStringMarker: string = 'RANDOM',
      subStringValue: string,
  ): string {
    const count = (str) => {
      const re = new RegExp(subStringMarker, "g");
      return ((str || '').match(re) || []).length;
    };
    const counter = count(inputString);
    for (let i = 0; i < counter; i++) {
      inputString = inputString.replace(subStringMarker, subStringValue);
    }

    return inputString;
  }

  public static replaceDataWithRandom(data: TableDefinition) {
    const randomPrefix = Helper.getRandomForString(
      data.raw().join(),
      Constants.RANDOM_MARKER
    );
    return Helper.applyRandom(data, Constants.RANDOM_MARKER, randomPrefix);
  }

  public static replaceWithRandom(
    data: string,
    randomMarker: string = Constants.RANDOM_MARKER,
    randomPrefix?: string
  ): string {
    return data.replace(new RegExp(randomMarker, 'g'), randomPrefix || Helper.getRandomForString(data));
  }

  /**
   * Replace string with values from CustomWorld.store
   * @param source string to be replaced
   * @param world context CustomWorld
   * @param varPrefix prefix for variable eg. %{VAR}, prefix %
   */
  public static replaceWithWorldValue(
    source: string,
    world: any,
    varPrefix: string = '%'
  ): any {
    const varsPath = source.match(new RegExp(`${varPrefix}{([^}]+)}`, 'g'));
    if (varsPath) {
      varsPath.forEach(x => {
        const resVar = x
          .replace(new RegExp(`(${varPrefix}{|})`, 'g'), '')
          .split('.');
        const rrr = world.findValue(resVar[0]);
        const res = resVar.length > 1 ? rrr[resVar[1]] : rrr;
        source = source.replace(x, res || x);
      });
    }
    return source;
  }

  /**
   * Replace string with random value from array saved into CustomWorld.store
   * @param source string to be replaced
   * @param world context CustomWorld
   * @param varPrefix prefix for variable eg. %{VAR}, prefix %
   */
  public static replaceWithRandomValueWorldArray(
      source: string,
      world: any,
      varPrefix: string = '%'
  ): any {
    const varsPath = source.match(new RegExp(`${varPrefix}{([^}]+)}`, 'g'));
    const filteredValue:string[]=[];
    if (varsPath) {
      varsPath.forEach(x => {
        const resVar = x
            .replace(new RegExp(`(${varPrefix}{|})`, 'g'), '')
            .split('.');
        const rrr:object[] = world.findValue(resVar[0]);
        rrr.forEach(a=>{
          filteredValue.push(a[resVar[1]]);
        });
      });
    }
    return filteredValue[(Helper.getRandomInt(0,filteredValue.length-1))];
  }

  /**
   * replaceWithBaseUrl
   */
  public static replaceWithBaseUrl(source: string): string {
    return source.replace('${BASE_URL}', process.env.BASE_URL);
  }

  /**
   * Replace string with Random from CustomWorld.store
   * @param source string to be replaced
   * @param world context CustomWorld
   * @param varPrefix prefix for variable eg. %{VAR}, prefix %
   */
  public static replaceWithWorldRandom(
    source: string,
    world: any
  ): string {
    if (!world.getRandom()) {
      world.setRandom(Helper.getRandomForString(source));
    }
    return source.replace(new RegExp(Constants.RANDOM_MARKER, 'g'), world.getRandom());
  }

  /**
   * Get world value for placeholder if exist
   */
  public static getWorldValue(
    source: string,
    world: any,
    varPrefix: string = '%'
  ): any {
    const varsPath = source.match(new RegExp(`${varPrefix}{([^}]+)}`, 'g'));
    let res;
    if (varsPath) {
      varsPath.forEach(x => {
        const resVar = x
          .replace(new RegExp(`(${varPrefix}{|})`, 'g'), '')
          .split('.');
        const rrr = world.findValue(resVar[0]);
        res = resVar.length > 1 ? rrr[resVar[1]] : rrr;
      });
    }
    return res;
  }

  public static addWorldValue(world: World, varName: string, data: any) {
    (world as CustomWorld<any>).keepValue(varName, data);
  };

  public static objToStrMap(obj): Map<string, string> {
    const strMap: Map<string, string> = new Map();
    for (const k of Object.keys(obj)) {
      strMap.set(k, obj[k]);
    }
    return strMap;
  }

  public static getUrlPath(url:string): string {
    const currentUrl = URL.parse(url);
    return  url.replace(currentUrl.protocol+"//"+currentUrl.hostname,"");
  }

  public static getNuberFromString(myString:string):string{
    const a = new RegExp("(\\d+)");
    const id = a.exec(myString);
    return id[0];
  }

  public static getIRcwLocation(gerkinData:object):IRcwLocation{
    const obj = {};
    // tslint:disable-next-line:no-string-literal
    const arr:[[string]] = gerkinData['rawTable'];
    const keys:string[] = [];
    // tslint:disable-next-line:prefer-for-of
    for(let i = 0; i< arr.length; i++){
      // tslint:disable-next-line:prefer-for-of
      for(let k=0; k<arr[i].length;k++){
        // console.log("Certain item ["+i+"] "+arr[i][k]);
        if(i===0){
          obj[arr[i][k]] = null;
          keys[k] = arr[i][k];
        }else {
          if(arr[i][k].includes('RANDOM')){
            arr[i][k] = Helper.getMultiRandomForString(arr[i][k]);
          }
          obj[keys[k]] = arr[i][k]
        }
      }
    }
    const rcwLocationDate:IRcwLocation = {
      "Location Name / Business Name": obj["Location Name / Business Name"],
      // tslint:disable-next-line:no-string-literal
      "Country": obj["Country"],
      "State / County / Region": obj["State / County / Region"],
      "Town / City": obj["Town / City"],
      "Business Category": obj["Business Category"],
      "Address Line 1": obj["Address Line 1"],
      "Zipcode / Postcode": obj["Zipcode / Postcode"],
      "Phone Number": obj["Phone Number"],
    };
    expect(Object.keys(obj),'Some of required keys UNDEFINED!!!!').to.have.members(Object.keys(rcwLocationDate));
    return rcwLocationDate;
  }

  public static getKeyNameByValue(requiredObject:object, value:string):string{
    let searchedKeyName:string = null;
    Object.keys(requiredObject).forEach(key => {
      if(requiredObject[key] === value){
        searchedKeyName = key;
      }
    });
    return searchedKeyName;
  }

  public static getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  public static openPath(path:string):void{
    browser.deleteAllCookies();
    browser.refresh();
    let pageUrl:string;
    if(path === '/'){
      pageUrl=browser.options.baseUrl;
    }else {
      pageUrl = browser.options.baseUrl + path;
    }
    browser.url(pageUrl);
  }

  public static getActualDirectiries(filePath?:string):string[]{
    // fs.readdirSync(".").forEach(file => console.log(file));
    let rawdata;
    if(!filePath){
      rawdata = readFileSync('./src/fixtures/src.json');
    }else {
      rawdata = readFileSync(filePath);
    }
    return JSON.parse(rawdata.toString());
  }

  public static getElementValueBySelector(elementSelector:string):string{
    this.scrollToElementByCss(elementSelector);
    const dataFromBrowser = browser.execute((selector) => {
      return document.querySelector(selector).value;
    },elementSelector);
    return dataFromBrowser.value;
  }

  public static getSelectedTextBySelector(elementSelector:string):string{
    this.scrollToElementByCss(elementSelector);
    const dataFromBrowser:any = browser.execute((selector) => {
      // @ts-ignore
      return (document.querySelectorAll(`${selector}>option`)[document.querySelector(`${selector}`).selectedIndex]).textContent.trim()
    },elementSelector);
    return dataFromBrowser.value;
  }

  public static getVisibleTextByFullSelector(elementSelector:string):string{
    this.scrollToElementByCss(elementSelector);
    const dataFromBrowser = browser.execute((selector) => {
      return document.querySelector(selector).textContent.trim()
    },elementSelector);
    return dataFromBrowser.value;
  }

  public static clickBySelector(elementSelector:string):string{
    this.scrollToElementByCss(elementSelector);
    const dataFromBrowser = browser.execute((selector) => {
      return document.querySelector(selector).click()
    },elementSelector);
    return dataFromBrowser.value;
  }

  public static getCheckedCheckBoxes(elementSelector:string):number{
    const dataFromBrowser = browser.execute((selector) => {
      // @ts-ignore
      return Array.from(document.forms[0].elements[selector]).filter(a=>a.checked===true).length
    },elementSelector);
    return dataFromBrowser.value;
  }

  public static unCheckElementByValue(checkBoxSelector:string, elementValue:string):void{
    browser.execute((selector, value) => {
      // @ts-ignore
      return Array.from(document.forms[0].elements[selector]).find(i => i.value===value).checked = false;
    },checkBoxSelector, elementValue);
  }

  public static scrollToElementByCss(elementSelector:string):void{
    browser.execute((selector) => {
      // @ts-ignore
      return document.querySelector(selector).scrollIntoView()
    },elementSelector);
  }

  public static getValueCheckedCheckBoxes(elementSelector:string):any{
    const dataFromBrowser = browser.execute((selector) => {
      // @ts-ignore
      return Array.from(document.forms[0].elements[selector]).filter(a=>a.checked===true).map(b=>b.value)
    },elementSelector);
    return dataFromBrowser.value;
  }
}

export { Helper };
