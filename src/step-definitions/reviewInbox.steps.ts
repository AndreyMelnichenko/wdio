import { expect } from 'chai';
import {When} from "cucumber";
import {ReviewInboxPage} from "../pages/ReviewInbox/reviewInbox.page";
import {Helper} from "../utils/helper";

When(/^reviewed data in table is sorted by Date in reverse-chronological order$/,function () {
   const reviewInboxPage = new ReviewInboxPage();
   // tslint:disable-next-line:no-unused-expression
   expect(reviewInboxPage.isRocordSortedByDate(),'Reviewed data not sorted by date').to.be.true;
});

// TODO THIS STEP SHOULD BE IMPLEMENTED
When(/^user can see reports with its name column$/,function () {
   const reviewInboxPage = new ReviewInboxPage();
   reviewInboxPage.pageIsLoaded();
   // tslint:disable-next-line:no-console
   console.log("Check data from BE");
});

When(/^main table contain item list '(.*)'$/,function (itemList:string) {
   const expectedItemList:string[] = itemList.split(";");
   const reviewInboxPage = new ReviewInboxPage();
   // tslint:disable-next-line:no-unused-expression
   expect(reviewInboxPage.isTableContainListOfItems(expectedItemList)).to.be.true;
});

When(/^main table for item list '(.*)' not contain empty rows$/,function (itemList:string) {
   const expectedItemList:string[] = itemList.split(";");
   const reviewInboxPage = new ReviewInboxPage();
   expectedItemList.forEach(
       item=>reviewInboxPage.checkTableContent(item));
});

When(/^click filter dropdown$/,function () {
   const reviewInboxPage = new ReviewInboxPage();
   reviewInboxPage.clickFilterDropDown();
});

When(/^filter options from list '(.*)' appeared$/,function (itemList:string) {
   const expectedItemList:string[] = itemList.split(";");
   const reviewInboxPage = new ReviewInboxPage();
   expectedItemList.forEach(item=>{
      // tslint:disable-next-line:no-unused-expression
      expect(reviewInboxPage.isOptionsApeared(item)).to.be.true;
   });
});

When(/^section '(.*)' contain sub-options from list "(.*)"$/,function (sectionName:string,itemList:string) {
   const expectedItemList:string[] = itemList.split(";");
   const reviewInboxPage = new ReviewInboxPage();
   expectedItemList.forEach(item=>{
      // tslint:disable-next-line:no-unused-expression
      expect(reviewInboxPage
          .isOptionsApeared(sectionName,item),
          'Element into filter section '+sectionName+' and name ['+item+'] not found')
          .to.be.true;
   });
});

When(/^click on '(.*)' from filter section "(.*)"$/,function (item:string, sectionName:string) {
   if(sectionName === 'Rating'){
      switch (item) {
         case "1 Stars":
            item=item.replace("Stars","Star");
            break;
         case "Not Recommended Stars":
         case "Recommended Stars":
         case "No rating Stars":
            item=item.replace("Stars","").trim();
      }
   }
   const reviewInboxPage = new ReviewInboxPage();
   if(sectionName === "Review Sources"){
      reviewInboxPage.setFilterSrcOption(sectionName,item);
   }else {
      reviewInboxPage.clickOnSectionItem(sectionName,item);
   }
});

When(/^click on '(.*)' from status folder buttons$/,function (status:string) {
   const reviewInboxPage = new ReviewInboxPage();
   reviewInboxPage.clickOnStatusFolderButton(status);
});

When(/^on page apeared '(.*)' reviews$/,function (reviewsCount:string) {
   const reviewInboxPage = new ReviewInboxPage();
   browser.pause(1000);
   expect(+reviewsCount).to.equal(reviewInboxPage.getFilteredResultCount());
});

When(/^on page '(.*)' button present$/,function (btnName:string) {
   const reviewInboxPage = new ReviewInboxPage();
   reviewInboxPage.isResetButton(btnName);
});

When(/^reset filters$/,function () {
   const reviewInboxPage = new ReviewInboxPage();
   reviewInboxPage.clickOnResetButton();
});

When(/^apply filters$/,function () {
   const reviewInboxPage = new ReviewInboxPage();
   reviewInboxPage.clickOnApplyFilterButton();
});

When(/^reports with review sources equal to '(.*)'$/,function (sourceName:string) {
   const reviewInboxPage = new ReviewInboxPage();
   reviewInboxPage.isFilteredDir(sourceName);
});

When(/^all records have '(.*)' stars$/,function (rating:string) {
   const reviewInboxPage = new ReviewInboxPage();
   reviewInboxPage.isAvgRatingHas(rating);
});

When(/^user on '(.*)' page$/,function (pageNimber:string) {
   const reviewInboxPage = new ReviewInboxPage();
   reviewInboxPage.isCurentPageNimber(pageNimber);
});

When(/^pagination info shows in format '(.*)'$/,function (paginationInfoFormat:string) {
   const reviewInboxPage = new ReviewInboxPage();
   const paginationInfo:string = reviewInboxPage.getPaginationInfo();
   expect(paginationInfo.replace(/\d/g,""),
       "There is a wrond pagination format ["+paginationInfoFormat+"]")
       .to.equal(paginationInfoFormat
       .replace("XX","")
       .replace("YY","")
       .replace("ZZ",""));
});

When(/^section '(.*)' contain sub-options from file "(.*)"$/,function (sectionName:string,filePath:string) {
   const expectedItemList:string[] = Helper.getActualDirectiries(filePath);
   expectedItemList.push('All');
   const reviewInboxPage = new ReviewInboxPage();
   expectedItemList.forEach(item=>{
      // tslint:disable-next-line:no-unused-expression
      expect(reviewInboxPage
              .isScrOptionsVisible(sectionName,item),
          'Element into filter section '+sectionName+' and name ['+item+'] not found')
          .to.be.true;
   });
});

When(/^status folder buttons from list appeared '(.*)'$/,function (statusButtonList:string) {
   const reviewInboxPage = new ReviewInboxPage();
   const expectedItemList:string[] = statusButtonList.split(";");
   expectedItemList.forEach(item=>{
      // tslint:disable-next-line:no-unused-expression
      expect(reviewInboxPage
              .isStatusFolderButton(item),
          'Current filter folder button name ['+item+'] not found')
          .to.be.true;
   });
});


When(/^set '(.*)' for first record$/,function (statusName:string) {
   const reviewInboxPage = new ReviewInboxPage();
   reviewInboxPage.setReviewStatusTo(statusName);
});

When(/^on page apeared '(.*)' reviews with '(.*)' status$/,function (count:string,statusName:string) {
   const reviewInboxPage = new ReviewInboxPage();
   const actualFilteredRecords:string = reviewInboxPage.getReviewWithStatus(statusName);
   expect(count).to.equal(actualFilteredRecords);
});
