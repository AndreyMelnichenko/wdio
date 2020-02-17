export class CampaignDetailsFillFormPage {

    private extraBusinessCategoryInput:string = "[data-hook='extraBusinessCategoriesList']";
    private extraCategoryDropDown:string = [this.extraBusinessCategoryInput,"[data-hook-name='extraBusinessCategories[1]']"].join(" ");
    private extraBusinessInput:string = "(//*[normalize-space(text())='Extra business categories:']/following::input)[2]";
    private valueOnDropDownSelector:string = "//div[@class='focus']/following-sibling::";
    private firstSearchResultSelector:string = "//div[contains(@class,'focus')]/following-sibling::div//div[@class='option active']";

    private openDropDownWithCategory(): CampaignDetailsFillFormPage{
        $(this.extraBusinessCategoryInput).scrollIntoView(true);
        $(this.extraCategoryDropDown).waitForDisplayed(3000);
        $(this.extraCategoryDropDown).waitForEnabled(3000);
        $(this.extraCategoryDropDown).click();
        return this;
    }

    public fillExtraBusinessCategory(value:string): CampaignDetailsFillFormPage{
        this.openDropDownWithCategory();
        browser.pause(1000);
        $(this.extraBusinessInput).setValue(value);
        browser.pause(1000);
        $(this.firstSearchResultSelector).waitForDisplayed(3000);
        $(this.firstSearchResultSelector).click();
        browser.pause(350);
        return this;
    }
}
