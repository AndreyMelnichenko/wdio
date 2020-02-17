export class RcwListingsReviewSources{
    private finishButton:string = "//button[@class='Button-button is-success is-medium is-radius is-null']";
    private actionButton:string = "/following::button[1]";
    private listingRecord:string = "//div[@class='ReviewSourcesItem-row']//label[@for='ReviewSourcesItem-%s']";

    public waitForReportsFinish():RcwListingsReviewSources{
        const isClickable:boolean = $(this.finishButton).waitForDisplayed(60*1000*10); // 10 min
        if (!isClickable){
            throw new Error("Finish button still not visible");
        }
        return this;
    }

    public isAbleToActionForListing(listingName:string,action:string):boolean{
        const listingSelector:string = this.listingRecord.replace("%s",listingName);
        $(listingSelector).waitForDisplayed(5000);
        const buttonActionSelector:string = listingSelector+this.actionButton;
        if($(buttonActionSelector).getText() === 'Disconnect'){
            return false;
        } else {
            return true;
        }
    }

    public clickOnFinish():void{
        const currentUrl: string = browser.getUrl();
        let newUrl:string = "";
        $(this.finishButton).click();
        browser.waitUntil(() => {
            newUrl = browser.getUrl();
            if(currentUrl === newUrl){
                return false;
            }else {
                return true;
            }
        },20000, "Page couldn't loaded after wait 20 sec "+currentUrl);
    }
}
