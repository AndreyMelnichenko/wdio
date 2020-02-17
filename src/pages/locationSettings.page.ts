import {URL} from "url";
import {Helper} from "../utils/helper";
import {BasePage} from "./base.page";

export class LocationSettings extends BasePage {
    public elementLocator:string = "//h1[text()='Dashboard Settings']";
    public pageUrl = new URL(`${browser.options.baseUrl}`);

    private toggleReportByPassword:string = "[data-controller='allowExternalReportByPassword']>.toggle-btn-label";
    private passwordInputForm:string = "//div[@data-target='form.passwordContainer' and contains(@style,'display:')]";
    private passwordInput:string = "[id='clientAccessPassword']";
    private saveSettingsButton:string = "button[type='submit']";
    private openExternalReportButton:string = ".LdSettings-externalActions a";
    private errorMessage:string = ".error";
    private passwordViewerButton:string = ".PasswordStrengthValidation-passwordViewer";
    private passwordTestInput:string = "[id='clientAccessPassword'][type='password']";

    public getURL(): URL {
        return new URL(`${this.pageUrl.href}location-dashboard/location/${this.pathId}/settings`);
    }

    public enableClientAccess():LocationSettings{
        $(this.toggleReportByPassword).waitForDisplayed(5000);
        $(this.passwordInputForm).waitForExist(5000);
        $(this.toggleReportByPassword).click();
        browser.pause(500);
        return this;
    }

    public setPasswordToExternalReport(externalPassword:string):LocationSettings{
        $(this.passwordInputForm).waitForExist(5000,true);
        $(this.passwordInput).waitForDisplayed(5000);
        $(this.passwordInput).setValue(externalPassword);
        browser.pause(500);
        return this;
    }

    public saveSettings():LocationSettings{
        $(this.saveSettingsButton).waitForDisplayed(5000);
        Helper.clickBySelector(this.saveSettingsButton);
        return this;
    }

    public openExternalReport():void{
        $(this.openExternalReportButton).waitForEnabled(5000);
        $(this.openExternalReportButton).waitForDisplayed(5000);
        $(this.openExternalReportButton).click();
    }

    public getErrorText():string{
        $(this.errorMessage).waitForDisplayed(5000);
        return $(this.errorMessage).getText();
    }

    public isViewerButtonShowPassword():boolean{
        $(this.passwordViewerButton).click();
        $(this.passwordTestInput).waitForDisplayed(5000);
        return $(this.passwordTestInput).isClickable();
    }
}
