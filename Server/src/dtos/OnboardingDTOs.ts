export interface HighNetWorthQualification {
  incomeQualified?: boolean; // Did you have £100,000+ income last year? (A)
  incomeAmount?: number; // Actual income, if applicable
  netAssetsQualified?: boolean; // Do you have £250,000+ net assets? (B)
  netAssetsAmount?: number; // Actual net assets, if applicable
  noneApply?: boolean; // (C) None of these apply
  declarationAccepted?: boolean; // Confirm declaration accepted
}

export interface SelfCertifiedSophisticatedInvestor {
  professionalCapacity?: boolean; // (A)
  professionalCapacityDetails?: string; // Org name, if yes
  director?: boolean; // (B)
  directorDetails?: {
    companyName?: string;
    companyNumber?: string;
  };
  unlistedInvestments?: boolean; // (C)
  unlistedInvestmentsCount?: number; // If yes, how many investments
  businessAngel?: boolean; // (D)
  businessAngelNetwork?: string; // Network/syndicate name
  noneApply?: boolean; // (E)
  declarationAccepted?: boolean;
}

export type EntityClassificationType =
  | 'investment_professional'
  | 'high_net_worth_company'
  | 'other';

export type HighNetWorthCompanySubType =
  | 'body_corporate_a'
  | 'body_corporate_b'
  | 'unincorporated_association'
  | 'trustee_high_value'
  | 'other_legal_person';

export interface BodyCorporateBDetails {
  entityName: string;
  referenceNumber?: string;
}

export interface EntityDetails {
  entityType?: EntityClassificationType;
  entityName?: string;
  referenceNumber?: string;
  highNetWorthCompanySubType?: HighNetWorthCompanySubType;
  bodyCorporateBDetails?: BodyCorporateBDetails;
  shareCapital?: number;
  netAssets?: number;

  membersCount?: number;
  trustAssetsValue?: number;
}

export interface InvestorOnboardingPayload {
  jurisdiction?: string;
  investorType?: 'individual' | 'entity';
  individualInvestorType?: 'high_net_worth' | 'self_certified_sophisticated_investor';
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
  lastCompletedStep?: string;
  [key: string]: any;
}

export interface CreateOnboardingRequest {
  formData: InvestorOnboardingPayload;
}

export interface UpdateOnboardingRequest {
  formData: InvestorOnboardingPayload;
}

export interface OnboardingStatusResponse {
  status: string;
  rejectionNote?: string;
}
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
}
