import { IUser } from '../models/User';
import { MyCompanyDetails } from './account-details/companyDetails.page';
import { BasePage } from './base.page';
import { PlansSelect } from './billing-details/plansSelect.page';
import { AddCampaign } from './citationBurst/addCampaign.page';
import { CitationBurst } from './citationBurst/citationBurst.page';
import { CampaignsDetails } from './citationBurst/details.page';
import { CampaignsLookup } from './citationBurst/lookup.page';
import { CampaignsNotify } from './citationBurst/notify.page';
import { OrderConfirmation } from './citationBurst/orderConfirmation.page';
import { CitationReportView } from './citationTracker/citationReportView';
import { CitationTracker } from './citationTracker/citationTracker.page';
import { CitationTool } from './citationTracker/tool.page';
import { ClientsAndLocations } from './clientsAndLocations.page';
import { AddClient } from './clientsAndLocations/addClient.page';
import { EditClient } from './clientsAndLocations/editClient.page';
import { GetTrial } from './getTrial.page';
import { GoogleLocalWizard } from './googleLocalWizard/googleLocalWizard.page';
import { GoogleLocalWizardTool } from './googleLocalWizard/tool.page';
import { AgencyDirectory } from './leadGen/agencyDirectory.page';
import { Leads } from './leadGen/leads.page';
import { WidgetSettings } from './leadGen/widgetSettings.page';
import { AddLSAReport } from './localSearchAudit/addReport.page';
import { LocalSearchAudit } from './localSearchAudit/localSearchAudit.page';
import { LocationDashboard } from './location.page';
import { LocationSettings } from "./locationSettings.page";
import { Login } from './login.page';
import { Onboarding } from './onboarding.page';
import { PurchaseConfirm } from './payment/purchaseConfirm.page';
import { PaymentConfirmation } from './paymentConfirmation.page';
import { AddLSRCReport } from './rankChecker/addReport.page';
import { RankChecker } from './rankChecker/rankChecker.page';
import { ReportCreationWizard } from './reportCreationWizard.page';
import { AddRMReport } from './reputationManager/addReport.page';
import { RMEditReport } from './reputationManager/editReport.page';
import { GetReviews } from './reputationManager/getReviews.page';
import { KioskReview } from './reputationManager/kioskReview.page';
import { MonitorReviews } from './reputationManager/monitorReviews.page';
import { ReputationManager } from './reputationManager/reputationManager.page';
import { RMViewReport } from './reputationManager/viewReport.page';
import { Signup } from './signUp/signup.page';
import { SignupCb } from "./signUp/singupCb.page";
import { Success } from './signUp/success.page';

class PageFactory {
  private static pages = [
    Login,
    ClientsAndLocations,
    Signup,
    Success,
    Onboarding,
    LocationDashboard,
    AddCampaign,
    CitationBurst,
    GetTrial,
    CampaignsLookup,
    CampaignsDetails,
    CampaignsNotify,
    CitationTracker,
    CitationTool,
    GoogleLocalWizard,
    GoogleLocalWizardTool,
    LocalSearchAudit,
    AddLSAReport,
    RankChecker,
    AddLSRCReport,
    ReputationManager,
    AddRMReport,
    Leads,
    AgencyDirectory,
    WidgetSettings,
    MyCompanyDetails,
    PaymentConfirmation,
    PurchaseConfirm,
    PlansSelect,
    CitationReportView,
    KioskReview,
    GetReviews,
    RMEditReport,
    RMViewReport,
    AddClient,
    EditClient,
    ReportCreationWizard,
    MonitorReviews,
    OrderConfirmation,
    SignupCb,
    LocationSettings
  ];

  // TODO method is not using
  public static getInstance<c extends BasePage>(
    page: new (user?: IUser) => c,
    user?: IUser
  ): c {
    const newPage: c = new page(user);
    return newPage;
  }
  /**
   *
   * Return new instance of page object matched by name
   * @static
   * @param {string} name
   * @returns new <T extends BasePage>
   * @memberof PageFactory
   */
  public static getPageForName(name: string) {
    const pageType = this.pages.find(
      i => i.name.toUpperCase() === name.replace(/ /g, '').toUpperCase()
    );
    if (!pageType) {
      throw new Error(
        `Couldn't define page for name "${name}"\nAviliable declared pages are:\n${this.pages
          .map(page => page.name)
          .join(',\n')}`
      );
    }
    const inst = new pageType();
    return inst;
  }
}

export { PageFactory };
