export class OnboardingStartPage {

    private businessTypeSelector: string = "//span[@class='Onboarding-chooseBusinessType-businessButton-name' and text()='%s']";
    private locationsRangeDropdown:string = "[data-hook='select']";
    private locationsRangeValue:string = ".selectize-dropdown-content>div[data-value='%s']";
    private nextStepButton:string = "[data-hook='nextStepButton']";

    private getBusinessTypeSelector(businessNameText : string) : string {
        return this.businessTypeSelector.replace("%s",businessNameText);
    }

    public choseYourBusinessType(businessType:string): OnboardingStartPage {
        const elementSelector:string = this.getBusinessTypeSelector(businessType);
        $(elementSelector).waitForDisplayed();
        $(elementSelector).click();
        return this;
    }

    private openLocationsRangeDropDown():OnboardingStartPage{
        $(this.locationsRangeDropdown).waitForDisplayed(5000);
        $(this.locationsRangeDropdown).click();
        return this;
    }

    private clickOnDropDownValue(value:string):OnboardingStartPage{
        const selector:string = this.locationsRangeDropdown +
            " " +
            this.locationsRangeValue.replace("%s",value);
        $(selector).waitForDisplayed(5000);
        $(selector).click();
        return this;
    }

    public setUpLocationsRange(locationRange:string):OnboardingStartPage{
        this.openLocationsRangeDropDown()
            .clickOnDropDownValue(locationRange);
        return this;
    }

    public clickToNextStep():void{
        $(this.nextStepButton).waitForDisplayed(5000);
        $(this.nextStepButton).click();
    }
}
