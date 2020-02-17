export interface Customer {
  id: string;
  firstName: string;
  lastName?: any;
  company?: any;
  email?: any;
  website?: any;
  phone?: any;
  fax?: any;
}

export interface Billing {
  id: string;
  firstName?: any;
  lastName?: any;
  company?: any;
  streetAddress?: any;
  extendedAddress?: any;
  locality?: any;
  region?: any;
  postalCode: string;
  countryName?: any;
  countryCodeAlpha2?: any;
  countryCodeAlpha3?: any;
  countryCodeNumeric?: any;
}

export interface Shipping {
  id?: any;
  firstName?: any;
  lastName?: any;
  company?: any;
  streetAddress?: any;
  extendedAddress?: any;
  locality?: any;
  region?: any;
  postalCode?: any;
  countryName?: any;
  countryCodeAlpha2?: any;
  countryCodeAlpha3?: any;
  countryCodeNumeric?: any;
}

export interface CreditCard {
  token: string;
  bin: string;
  last4: string;
  cardType: string;
  expirationMonth: string;
  expirationYear: string;
  customerLocation: string;
  cardholderName: string;
  imageUrl: string;
  prepaid: string;
  healthcare: string;
  debit: string;
  durbinRegulated: string;
  commercial: string;
  payroll: string;
  issuingBank: string;
  countryOfIssuance: string;
  productId: string;
  globalId: string;
  accountType?: any;
  uniqueNumberIdentifier: string;
  venmoSdk: boolean;
  maskedNumber: string;
  expirationDate: string;
}

export interface StatusHistory {
  timestamp: Date;
  status: string;
  amount: string;
  user: string;
  transactionSource: string;
}

export interface Subscription {
  billingPeriodEndDate?: any;
  billingPeriodStartDate?: any;
}

export interface Descriptor {
  name?: any;
  phone?: any;
  url?: any;
}

export interface DisbursementDetails {
  disbursementDate?: any;
  settlementAmount?: any;
  settlementCurrencyIsoCode?: any;
  settlementCurrencyExchangeRate?: any;
  fundsHeld?: any;
  success?: any;
}

export interface StatusHistory2 {
  disbursementDate: string;
  effectiveDate: string;
  status: string;
  timestamp: Date;
}

export interface Transaction {
  id: string;
  amount: string;
  createdAt: Date;
  orderId: string;
  purchaseOrderNumber?: any;
  paymentInstrumentSubtype: string;
}

export interface TransactionDetails {
  id: string;
  amount: string;
  createdAt: Date;
  orderId: string;
  purchaseOrderNumber?: any;
  paymentInstrumentSubtype: string;
}

export interface Dispute {
  id: string;
  amount: string;
  amountDisputed: string;
  amountWon: string;
  caseNumber: string;
  createdAt: Date;
  currencyIsoCode: string;
  dateOpened: string;
  dateWon?: any;
  processorComments?: any;
  kind: string;
  merchantAccountId: string;
  reason: string;
  reasonCode: string;
  reasonDescription?: any;
  receivedDate: string;
  referenceNumber?: any;
  replyByDate: string;
  status: string;
  updatedAt: Date;
  originalDisputeId?: any;
  evidence: any[];
  statusHistory: StatusHistory2[];
  transaction: Transaction;
  transactionDetails: TransactionDetails;
}

export interface RiskData {
  id: string;
  decision: string;
  fraudServiceProvider: string;
  deviceDataCaptured: boolean;
}

export interface PaypalAccount { }

export interface CoinbaseAccount { }

export interface ApplePayCard { }

export interface AndroidPayCard { }

export interface VisaCheckoutCard { }

export interface MasterpassCard { }

export interface SamsungPayCard { }

export interface BTransaction {
  id: string;
  status: string;
  type: string;
  currencyIsoCode: string;
  amount: string;
  merchantAccountId: string;
  subMerchantAccountId?: any;
  masterMerchantAccountId?: any;
  orderId: string;
  createdAt: Date;
  updatedAt: Date;
  customer: Customer;
  billing: Billing;
  refundId?: any;
  refundIds: any[];
  refundedTransactionId?: any;
  partialSettlementTransactionIds: any[];
  authorizedTransactionId?: any;
  settlementBatchId: string;
  shipping: Shipping;
  customFields: string;
  avsErrorResponseCode?: any;
  avsPostalCodeResponseCode: string;
  avsStreetAddressResponseCode: string;
  cvvResponseCode: string;
  gatewayRejectionReason?: any;
  processorAuthorizationCode: string;
  processorResponseCode: string;
  processorResponseText: string;
  additionalProcessorResponse?: any;
  voiceReferralNumber?: any;
  purchaseOrderNumber?: any;
  taxAmount?: any;
  taxExempt: boolean;
  creditCard: CreditCard;
  statusHistory: StatusHistory[];
  planId?: any;
  subscriptionId?: any;
  subscription: Subscription;
  addOns: any[];
  discounts: any[];
  descriptor: Descriptor;
  recurring: boolean;
  channel?: any;
  serviceFeeAmount?: any;
  escrowStatus?: any;
  disbursementDetails: DisbursementDetails;
  disputes: Dispute[];
  authorizationAdjustments: any[];
  paymentInstrumentType: string;
  processorSettlementResponseCode: string;
  processorSettlementResponseText: string;
  riskData: RiskData;
  threeDSecureInfo?: any;
  shipsFromPostalCode?: any;
  shippingAmount?: any;
  discountAmount?: any;
  networkTransactionId: string;
  refundGlobalIds: any[];
  partialSettlementTransactionGlobalIds: any[];
  refundedTransactionGlobalId?: any;
  authorizedTransactionGlobalId?: any;
  globalId: string;
  processorResponseType: string;
  authorizationExpiresAt: Date;
  paypalAccount: PaypalAccount;
  coinbaseAccount: CoinbaseAccount;
  applePayCard: ApplePayCard;
  androidPayCard: AndroidPayCard;
  visaCheckoutCard: VisaCheckoutCard;
  masterpassCard: MasterpassCard;
  samsungPayCard: SamsungPayCard;
}
