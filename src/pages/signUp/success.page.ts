import { URL } from 'url';
import { Signup } from './signup.page';

class Success extends Signup {
  public pageUrl: URL = new URL(`${this.pageUrl.href}/success`);
  private businessTypeInputs: string = '[name="business_type"]';
  private helpAreas: string = '[name="help_areas[]"]';
  public elementLocator: string = '#contentWrapper';

  public selectBusinessType(businessType: string): Success {
    $$(this.businessTypeInputs)
      .filter(x => x.getText() === businessType)[0]
      .click();
    return this;
  }

  public selectHelpAreas(...helpArea: string[]): Success {
    $$(this.helpAreas).forEach(element => {
      if (helpArea.find(x => x === element.getText())) {
        element.click();
      }
    });
    return this;
  }
}

export { Success };
