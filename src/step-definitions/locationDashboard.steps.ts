import { expect } from 'chai';
import { Given, TableDefinition, Then, When } from 'cucumber';
import { LocationDashboard } from '../pages/locationDashboard.page';
import { SocialPage } from '../pages/social.page';

const locationDashboard = new LocationDashboard();
const socialPage = new SocialPage();

Then(
     /^user go to social page$/,
     function () {
          locationDashboard.goToSocialBoard();
     }
   );

Then(
     /^user click to '(.*)' tab$/,
     function (tabName:string) {
          switch (tabName) {
               case "Facebook":
                    socialPage.goToFbTab();
                 break;
               case "Twitter":
                 // tslint:disable-next-line: no-console
                 console.log("Not implemented");
                 break;        
             }
     }
   );
