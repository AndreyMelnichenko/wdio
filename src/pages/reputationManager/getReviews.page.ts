import { URL } from 'url';
import { FeedbackTemplate } from '../../models/KioskTemplate';
import { TemplateSteps } from '../../utils/constants';
import { BasePage } from '../base.page';
import { ReputationManager } from './reputationManager.page';

class GetReviews extends ReputationManager {
  public pageUrl: URL = new URL(`${this.pageUrl.href}/get-reviews`);
  public elementLocator: string = "//*[text()='Get Reviews']";
  public spinner = '.Wave-wave';
  public buttonNewTemplate = '//*[text()="Create New Template"]';
  public generateCampaignUrlButton = '.GetStarted-generateCampaignUrlButton';
  private templateSteps: Array<{ title: string; btnTxt: string }> = [
    { title: TemplateSteps.GENERAL, btnTxt: 'Next' },
    { title: TemplateSteps.EMAILS, btnTxt: 'Next' },
    { title: TemplateSteps.LANDING, btnTxt: 'Next' },
    { title: TemplateSteps.MODE, btnTxt: 'Save Template' }
  ];

  /**
   * Setup Feedback template based on params
   *
   * @param {FeedbackTemplate} params
   * @memberof GetReviews
   */
  public setupFeedbackTemplate(params: FeedbackTemplate) {
    // Switch to Get Reviews tabs

    this.waitUntilSpinnerEnd();

    console.log("Setup Feedback template based on params");

    // Create new template
    if (BasePage.ifElementVisible(this.buttonNewTemplate)) {
      console.log("Create new template");
      BasePage.clickOnButton('Create New Template');
    }
    else {
      console.log("Create new template else");
      BasePage.clickOnButton('Get Started');
    }

    console.log("General Settings");
    BasePage.ifTextExist('General Settings');

    this.templateSteps.forEach(step => {
      this.waitUntilSpinnerEnd();
      BasePage.ifTextExist(step.title);

      // Setup General
      if (params.templateName && step.title === TemplateSteps.GENERAL) {
        BasePage.addInputByDataHook('nameField', params.templateName);
      }

      // Setup Emails
      if (params.emailSubject && step.title === TemplateSteps.EMAILS) {
        this.waitUntilSpinnerEnd();
        BasePage.ifTextExist("Edit mode");
        BasePage.clickOnButton('Edit mode');
        this.waitUntilSpinnerEnd();
        BasePage.ifTextExist('Email subject:');
        BasePage.addInputByDataHook('emailSubjectField', params.emailSubject);
      }

      // Setup Kios Mode
      if (step.title === TemplateSteps.MODE) {
        browser.pause(1000);
        console.log("Setup Kios Mode");
        if (params.allowUseReview || params.allowReceiveMarketingEmails) {
          this.waitUntilSpinnerEnd();
          // BasePage.clickOnButton('Next');
          BasePage.ifTextExist('Feedback page');
          BasePage.clickOnButton('Feedback page');
          this.waitUntilSpinnerEnd();
          BasePage.clickAndValidate('Edit mode', 'Introductory text:');

          // allowUseReview
          if (
            BasePage.getCheckboxState('allowUseReview') !==
            JSON.parse(params.allowUseReview)
          ) {
            BasePage.scrollDown(10);
            // BasePage.clickChBoxIput('allowUseReview');
            BasePage.clickOnButton('Give people the option to write a review for use on your website/marketing materials.');
          }

          // allowReceiveMarketingEmails
          if (
            BasePage.getCheckboxState('allowReceiveMarketingEmails') !==
            JSON.parse(params.allowReceiveMarketingEmails)
          ) {
            BasePage.scrollDown(10);
            BasePage.clickOnButton('Enable GDPR Opt-in');
            // BasePage.clickChBoxIput('allowReceiveMarketingEmails');
          }
        }
        if (params.positiveEmailSubject) {
          // Positive feedback email
          this.editInputField(
            params.positiveEmailSubject,
            'Positive feedback step',
            'Edit mode',
            'Email subject:',
            'emailSubjectField'
          );
        }
        if (params.negativeEmailSubject) {
          // Negative feedback email
          this.editInputField(
            params.negativeEmailSubject,
            'Negative feedback step',
            'Edit mode',
            'Email subject:',
            'emailSubjectField'
          );
        }
      }
      BasePage.clickOnButton(step.btnTxt);
      browser.pause(500);
      this.waitUntilSpinnerEnd();
    });

    // Check review sites
    if (BasePage.ifTextExist('Select Review Sites', 1)) {
      // add Google to review sites
      BasePage.clickOnButton('Select Review Sites');
      BasePage.useSelectizeDropDown('Google', 'Review site:');
      BasePage.addInputByDataHook('profileUrlField', 'https://google.com');
      BasePage.clickOnButton('Continue', true);
    }
    const elButton = $(this.generateCampaignUrlButton);
    browser.pause(1000);
    elButton.waitForDisplayed(10000);
    elButton.click();
    this.waitUntilSpinnerEnd();
    BasePage.ifTextExist('Kiosk & Link Mode URLs');
  }

  public addNewReviewSite(name: string, url: string) {
    BasePage.setInputValue(name, 'Please select Review site');
    BasePage.addInputByDataHook('profileUrlField', url, false);
  }

  private editInputField(value, tabName, togleName, fieldTitle, dataHook) {
    this.waitUntilSpinnerEnd();
    BasePage.clickOnButton(tabName);
    this.waitUntilSpinnerEnd();
    BasePage.clickOnButton(togleName);
    this.waitUntilSpinnerEnd();
    BasePage.ifTextExist(fieldTitle);
    BasePage.addInputByDataHook(dataHook, value);
  }
}

export { GetReviews };
