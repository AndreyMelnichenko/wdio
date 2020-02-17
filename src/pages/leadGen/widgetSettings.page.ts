import { URL } from 'url';
import { CssProperty } from 'webdriverio';
import { Leads } from './leads.page';

class WidgetSettings extends Leads {
  public pageUrl: URL = new URL(`${this.pageUrl.href}/widget-settings`);
  public elementLocator: string = "//*[text()='LeadGen Widget Settings']";
  public benefitsTextFrame: string = 'iframe[id="benefitsText_ifr"]';
  public benefitsTextFrameBody: string = '#tinymce';
  public colorPicker = {
    hexInput: "//span[text() = 'hex']/..//input"
  };

  public addBenefitsText(text: string): void {
    const frame = $(this.benefitsTextFrame).value;
    browser.frame(frame);
    $(this.benefitsTextFrameBody).setValue(text);
    browser.keys('Enter');
    browser.frame(null);
  }

  public switchToWidget(): WidgetSettings {
    const frame = $('iframe').value;
    browser.frame(frame);
    return this;
  }

  public switchBack(): WidgetSettings {
    browser.frame(null);
    return this;
  }

  public setHexColor(hex: string): WidgetSettings {
    $(this.colorPicker.hexInput).setValue(hex);
    return this;
  }

  public getHexColor(
    fieldName: string = 'background' ||
      'buttonBackground' ||
      'text' ||
      'buttonText'
  ): string {
    let property: CssProperty;
    this.switchToWidget();
    switch (fieldName) {
      case 'background':
        property = $('#widget').getCssProperty('background-color');
        break;
      case 'buttonBackground':
        property = $('button').getCssProperty('background-color');
        break;
      case 'text':
        property = $('#widget').getCssProperty('color');
        break;
      case 'buttonText':
        property = $('button').getCssProperty('color');
        break;
      default:
        throw new Error('Invalid target field type');
    }
    this.switchBack();
    return property.parsed.hex;
  }
}

export { WidgetSettings };
