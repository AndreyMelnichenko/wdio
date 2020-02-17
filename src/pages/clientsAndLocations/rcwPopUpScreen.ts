import { expect } from 'chai';

export class RcwPopUpScreen {
    private closeButton:string = ".RcwMonitoringDialog-dialog>a.close-reveal-modal";
    private toolIcon:string = "[data-tooltip='%s']";
    private monitorAllData:string = ".js-RcwMonitoringDialog-monitorAllDataButton";
    private allToolIcons:string = ".js-RcwMonitoringDialog-toolsIcons>[data-tooltip]";

    public toolIconShouldPresent(toolName:string):RcwPopUpScreen {
        const elementSelector: string = this.toolIcon.replace("%s",toolName);
        $(elementSelector).waitForDisplayed(5000);
        // tslint:disable-next-line:no-unused-expression
        expect($(elementSelector).isClickable()).is.true;
        return this;
    }

    public clickOnMonitorAllData():void{
        $(this.monitorAllData).waitForDisplayed(5000);
        $(this.monitorAllData).click();
    }

    public getToolIconsArr(): string[]{
        const iconsAtPageArr:string[] = [];
        $(this.allToolIcons).waitForDisplayed(5000);
        $$(this.allToolIcons).map((element)=>(iconsAtPageArr.push(element.getAttribute('data-tooltip'))));
        return iconsAtPageArr;
    }

    public closeModalPopUp():void{
        $(this.closeButton).waitForDisplayed(5000);
        $(this.closeButton).click();
    }
}
