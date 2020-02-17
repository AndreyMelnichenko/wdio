import { expect } from 'chai';
import {Then} from "cucumber";
import {LocationSettings} from "../pages/locationSettings.page";

const locationSettings : LocationSettings = new LocationSettings();

Then(/^set password '(.*)' and open external report$/,function (reportPassword:string) {
    locationSettings.enableClientAccess()
        .setPasswordToExternalReport(reportPassword)
        .saveSettings()
        .openExternalReport();
});

Then(/^set password '(.*)' and click save settings$/,function (reportPassword:string) {
    locationSettings.enableClientAccess()
        .setPasswordToExternalReport(reportPassword)
        .saveSettings();
});

Then(/^error message '(.*)' contain text '(.*)'$/,function (isError:string,errorText:string) {
    if(isError.endsWith('not')){
        locationSettings.openExternalReport();
    }else {
        expect(locationSettings.getErrorText(),'Current ERROR text doesnt much expected').to.include(errorText);
    }
});

Then(/^check passwordViewer button$/,function () {
    locationSettings.isViewerButtonShowPassword();
});
