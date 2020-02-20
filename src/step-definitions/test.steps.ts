import { When } from "cucumber";

When(/^Open main page$/, function () {
    browser.url("https://www.w3schools.com/");
});

When(/^test step$/,function () {
browser.debug();
});