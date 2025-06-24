// export interface FundCreateRequest {
//   name: string;
//   fundSize: string;
//   fundType: string;
//   targetGeographies: string;
//   targetSectors: string;
//   targetMOIC: string;
//   targetIRR: string;
//   minimumInvestment: string;
//   fundLifetime: string;
//   fundDescription?: string;
//   documents?: Array<{ fileUrl: string; uploadedAt?: string }>;
//   investors?: Array<{
//     investorId: string;
//     amount: number;
//     documentUrl: string;
//     addedAt?: string;
//   }>;
// }
interface FundDocument {
  fileUrl: string;
  uploadedAt: string;
}

interface Investor {
  investorId: string;
  documentUrl?: string;
  [key: string]: any;
}

interface FundCreateRequest {
  investors: Investor[];
  documents?: FundDocument[];
  [key: string]: any;
}

interface FundUpdateRequest extends Partial<FundCreateRequest> {
  existingDocuments?: FundDocument[];
  existingInvestors?: Investor[];
}

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  statusCode: number;
  data?: T;
  error?: string;
}
