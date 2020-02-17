import {Helper} from "../../utils/helper";

export class ReportsConnectionsWizardPage{
    private headerText: string = "//span[contains(text(),'%s')]";
    private fbAccConnectedButton:string = "//span[text()='My blog test page TEST 2']";
    private gmbLocationRadio:string = "//label[text()='%s']/../../td[@class='AccountItemsList-radio']/input";
    private gmbLocationModal:string = "//div[text()='Please select Location']";
    private toolsBoxed:string = "label.is-active";
    private blockedTool:string = "label.is-active input[checked][disabled]";


    public isHeaderTextPresent(text:string):ReportsConnectionsWizardPage{
        $(this.headerText.replace("%s",text)).waitForDisplayed(5000);
        return this;
    }

    public getRcwUrl():string {
        browser.pause(200);
        return browser.getUrl();
    }

    public isSubscriptionAvaliable(subscrName:string):boolean{
        return $(this.headerText.replace("%s",subscrName)+"/following-sibling::a[text()='Buy Addon'][1]").isClickable();
    }

    public isSubscriptionChecked(subscrName:string):boolean{
        return $(this.headerText.replace("%s",subscrName)+"/ancestor::node()[contains(@class,'is-active')][1]").isExisting()
    }

    public isFBaccountConnecter():boolean{
        browser.pause(500);
        return $(this.fbAccConnectedButton).isClickable();
    }

    public waitForModalPresent():ReportsConnectionsWizardPage{
        browser.waitUntil(
            () => $(this.gmbLocationModal).isClickable(),
            1000*300,
            "GMB modal to choose location didn't appeared"
        );
        return this;
    }

    public clickOnGmbLocation(locationName:string):ReportsConnectionsWizardPage{
        const elementSelector:string = this.gmbLocationRadio.replace("%s",locationName);
        $(elementSelector).waitForDisplayed(15000);
        $(elementSelector).click();
        return this;
    }

    public getCheckedToolBoxesAmount():number{
        return $$(this.toolsBoxed).length;
    }

    public clickOnToolBoxByIndex(index: number):ReportsConnectionsWizardPage {
        $$(this.toolsBoxed)[index].click();
        return this;
    }

    public deselectTools():ReportsConnectionsWizardPage {
        do{
            const randomToolIndex:number = Helper.getRandomInt(0,this.getCheckedToolBoxesAmount()-1);
            this.clickOnToolBoxByIndex(randomToolIndex);
            browser.pause(300);
        } while (this.getCheckedToolBoxesAmount()!==1);
        return this;
    }

    public isChekedAndBlokedTool():boolean{
        return $(this.blockedTool).isClickable();
    }
}
