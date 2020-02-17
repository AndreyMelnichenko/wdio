interface IKioskUser {
  rating?: number;
  feedback?: string;
  name?: string;
  email?: string;
  allowUseReview?: boolean;
  allowReceiveMarketingEmails?: boolean;
  check_allowUseReview?: boolean;
  check_allowReceiveMarketingEmails?: boolean;
}

export { IKioskUser };
