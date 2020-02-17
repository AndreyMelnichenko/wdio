export class LocationDashboard {
     private socialPageSelector: string = "[data-side-bar-item='social_platforms']";
  
     public goToSocialBoard():void{
       $(this.socialPageSelector).waitForDisplayed(5000);
       $(this.socialPageSelector).click();
     }
}
