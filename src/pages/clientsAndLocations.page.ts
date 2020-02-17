import { URL } from 'url';
import { BasePage } from './base.page';

class ClientsAndLocations extends BasePage {
  public pageUrl = new URL(`${browser.options.baseUrl}clients-and-locations`);
  public elementLocator = "//*[@id='content']//*[text()='Clients & Locations']";

  private locationDropdownTrigger = '.ClientsLocations-Locations-dropdownTrigger';
  private locationdropdown = '.ClientsLocations-Locations-dropdown';

  public chooselocationPerPage(num: number) {
    const elem = $(this.locationDropdownTrigger);
    const dd = $(this.locationdropdown);
    elem.click();
    this.waitUntilClass(dd, (x: string) => x.includes('is-visible'));
    BasePage.ifTextExist(`${num} per page`);
    BasePage.clickOnButton(`${num} per page`);
    this.waitUntilClass(dd, (x: string) => x.includes('is-visible'), true);
  }

  private waitUntilClass(elem, includes: (arg: string) => boolean, reverse = false): any {
    elem.waitUntil(() => {
      const classs: string = elem.getAttribute('class');
      return (reverse) ? !includes(classs) : includes(classs);
    })
  }

  public waitPageLoaded():void{
    $(this.elementLocator).waitForDisplayed(5000);
  }


}

export { ClientsAndLocations };
