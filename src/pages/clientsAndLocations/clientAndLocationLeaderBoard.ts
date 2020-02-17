export class ClientAndLocationLeaderBoard{

    private viewDashboardButtonSelector:string = "(//a[contains(@class,'is-first') and @href])[1]";

    public clickOnViewDashboardButton():ClientAndLocationLeaderBoard {
        $(this.viewDashboardButtonSelector).waitForDisplayed(3000);
        $(this.viewDashboardButtonSelector).click();
        return this;
    }
}
