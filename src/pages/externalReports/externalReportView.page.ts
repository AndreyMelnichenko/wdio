export class ExternalReportView{

    private elementSelector:string = "//li[@class='current' and text()='Reputation Manager report for:']";
    private inactiveGetReviewsTab:string = "//li[@class=' js-get_reviews']/a[contains(text(),'Get Reviews')]";
    private activeGetReviewsTab:string = "//li[@class='active js-get_reviews']/a[contains(text(),'Get Reviews')]";
    private loginModalContainer:string = ".Login-title";
    private passwordInput:string = "input[id='password']";
    private logInToReport:string = "//button[text()='Log in']";
    private loginStatusElements:string = "//div[@class='ClientAccess-authActions right']/a[1]";

    public waitForPageLoad():ExternalReportView{
        $(this.elementSelector).waitForDisplayed(5000);
        return this;
    }

    public switchToGetReviewsTab():ExternalReportView{
        $(this.inactiveGetReviewsTab).waitForDisplayed(5000);
        $(this.inactiveGetReviewsTab).click();
        return this;
    }

    private isLoginContainerVisible():boolean{
        return $(this.loginModalContainer).isClickable();
    }

    public setPasswordForReviewReport(password:string):ExternalReportView{
        browser.waitUntil(
            () => this.isLoginContainerVisible(),
            5000,
            "login form still not displayed");
        $(this.passwordInput).waitForDisplayed(5000);
        $(this.passwordInput).setValue(password);
        $(this.logInToReport).click();
        browser.pause(1000);
        browser.waitUntil(
            () => !this.isLoginContainerVisible(),
            5000,
            "login form still displayed");
        browser.pause(1000);
        return this;
    }

    public isUserLogin():boolean{
        if(($(this.loginStatusElements).getText()).includes("Logout")){
            return true;
        }else {
            return false;
        }
    }
}
