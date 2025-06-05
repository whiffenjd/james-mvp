// All interfaces and types here
export interface InvestorOnboardingPayload {
  jurisdiction?: string;
  investorType?: "individual" | "entity";
  individualInvestorType?:
    | "high_net_worth"
    | "self_certified_sophisticated_investor";
  highNetWorthQualification?: HighNetWorthQualification;
  selfCertifiedSophisticatedInvestor?: SelfCertifiedSophisticatedInvestor;
  entityClassification?: EntityClassificationType;
  entityDetails?: EntityDetails;
  kycDocumentUrl?: string;
  proofOfAddressUrl?: string;
  entityDocuments?: Array<{ type: string; url: string; fileName?: string }>;
  declarationAccepted?: boolean;
  signature?: string;
  signatureDate?: string;
  [key: string]: any;
}

export interface HighNetWorthQualification {
  incomeQualified?: string;
  incomeAmount?: number;
  netAssetsQualified?: string;
  netAssetsAmount?: number;
  noneApply?: boolean;
  declarationAccepted?: boolean;
}

export interface SelfCertifiedSophisticatedInvestor {
  professionalCapacity?: boolean;
  professionalCapacityDetails?: string;
  director?: boolean;
  directorDetails?: {
    companyName?: string;
    companyNumber?: string;
  };
  unlistedInvestments?: boolean;
  unlistedInvestmentsCount?: number;
  businessAngel?: boolean;
  businessAngelNetwork?: string;
  noneApply?: boolean;
  declarationAccepted?: boolean;
}

export type EntityClassificationType =
  | "investment_professional"
  | "high_net_worth_company"
  | "other";

export interface EntityDetails {
  entityType?: EntityClassificationType;
  entityName?: string;
  referenceNumber?: string;
  highNetWorthCompanySubType?: string;
  bodyCorporateBDetails?: any;
  shareCapital?: number;
  netAssets?: number;
  membersCount?: number;
  trustAssetsValue?: number;
}
