import { expect } from 'chai';
import { Given, When } from "cucumber";
import { BasePage } from "../pages/base.page";
import { ClientsAndLocations } from "../pages/clientsAndLocations.page";
import {RcwPopUpScreen} from "../pages/clientsAndLocations/rcwPopUpScreen";
import { Helper } from "../utils/helper";

const page = new ClientsAndLocations();
const rcwScreen = new RcwPopUpScreen();

When(/^user choose (\d+) per page drpodown$/, function (n: number) {
    page.chooselocationPerPage(n);
});

When(/^keep (\d+)-st location data as "(.*)"$/, function (tableIndex: number, varName: string) {
    const table = BasePage.getTable({ name: "Locations" }, [
        { cellHeader: 'Actions', attrName: 'href', elem: 'a' }
    ]);
    // tslint:disable-next-line:no-string-literal
    table.forEach(x => x["href"] = x["Actions"].location.getAttribute('href'));
    Helper.addWorldValue(this, varName, table[tableIndex - 1]);
});

When(/^user see icons for tool in the following order:"(.*)"$/,function (toolList:string) {
const expectedIconsOrdering:string[] = toolList.split(";");
expectedIconsOrdering.map((element)=>rcwScreen.toolIconShouldPresent(element));
const actualIconsOrdering:string[] = rcwScreen.getToolIconsArr();
expect(expectedIconsOrdering).to.deep.equal(actualIconsOrdering);
});

When(/^close modal screen$/,function () {
    rcwScreen.closeModalPopUp();
});
