export class SocialPage {
     private facebookTab = "[data-id='tab-facebook']";
     private twitterTab = "[data-id='tab-twitter']";
     private fbNavPanel = ".sm-facebook-navigation";
     private fbTable = "table-facebook";
     private accountSecondaryOptionsButton = ".sm-options-account-holder";

     public goToFbTab(): void {
          $(this.facebookTab).waitForDisplayed(5000);
          $(this.facebookTab).click();
     }
}
