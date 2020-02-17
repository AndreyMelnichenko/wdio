export class ImportYourLocations {
    private readonly City: string;

    constructor(cityName: string) {
        this.City = cityName;
    }

    public address: string = "input[data-hook='address1Input']";
    private dropDown: string = "//span[text()='%s']";
    private cityDropDownList: string = "div.focus~div .option[data-value='%s']";
    private cityInput: string = "(//*[normalize-space(text())='State / County / Region…']/following::input)[1]";
    private valueFromList: string = "/following-sibling::div//div[@class='selectize-dropdown single' and contains(@style,'display: block;')]//div[@data-value='%s']";
    private titleMessage: string = ".Onboarding-addLocation-title-message";
    private findYourBusinessButton: string = "[data-hook=findLocationButton]";
    private requiredTextOnPage: string = "//*[text()='%s']";
    private checkedRadio: string = "[type='radio'][checked]";
    private textIntoCategoty:string = "//div[@class='Onboarding-addLocation-label-container']//span[@class='Onboarding-addLocation-label-name' and text()='%s']/ancestor::node()[2]//div[@class='selectize-container Onboarding-addLocation-label-field ']//div[@class='item' and text()]";
    private nextStapButton:string = "[data-hook='nextStepButton']";

    public waitNextStepButtonAndClick():void{
        $(this.nextStapButton).waitForDisplayed(5000);
        $(this.nextStapButton).waitForEnabled(5000);
        $(this.nextStapButton).click();
    }

    public accountConnectedAndChecked(): void {
        $(this.checkedRadio).waitForDisplayed(5000);
    }

    public setUpCity(): void {
        $(this.cityInput).waitForExist();
        browser.setTimeout({'implicit': 100});
        $(this.cityInput).setValue(this.City);
        $(this.cityDropDownList.replace("%s", this.City)).click();
        browser.waitUntil(
            () => this.isTitleMessageEqualTo("Nearly there! We just need to confirm the information for your location."),
            5000,
            "Title message doesnt much");
    }

    public waitForDataBeChoosen(categotyName:string):void{
        const elementSelector:string = this.textIntoCategoty.replace("%s",categotyName);
        browser.waitUntil(
            () => {
                console.log($(elementSelector).getText());
                return $(elementSelector).getText()!==""
            },
            5000,
            "Expected text did not appeared");
    }

    public clickOnFindYourBusiness(): void {
        $(this.findYourBusinessButton).waitForDisplayed(5000);
        $(this.findYourBusinessButton).click();
    }

    public isPageContainText(text: string): boolean {
        const elementLocator = this.requiredTextOnPage.replace("%s", text);
        browser.pause(400);
        return $(elementLocator).isClickable();
    }

    private openDropDownList(dropDownName: string): ImportYourLocations {
        const elementSelector = this.dropDown.replace("%s", dropDownName);
        $(elementSelector).waitForDisplayed(3000);
        $(elementSelector).click();
        return this;
    }

    private isTitleMessageEqualTo(titleValue: string): boolean {
        $(this.titleMessage).waitForDisplayed(3000);
        return $(this.titleMessage).getText() === titleValue;
    }

    public chooseValueFromList(dropDownName: string, cityName: string): ImportYourLocations {
        this.openDropDownList(dropDownName);
        const elementSelector = this.dropDown.replace("%s", dropDownName) + this.valueFromList.replace("%s", cityName);
        $(elementSelector).waitForDisplayed(5000);
        $(elementSelector).click();
        browser.pause(1000);
        return this;
    }
}
