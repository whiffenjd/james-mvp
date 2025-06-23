export interface FundCreateRequest {
  name: string;
  fundSize: string;
  fundType: string;
  targetGeographies: string;
  targetSectors: string;
  targetMOIC: string;
  targetIRR: string;
  minimumInvestment: string;
  fundLifetime: string;
  fundDescription?: string;
  documents?: Array<{ fileUrl: string; uploadedAt?: string }>;
  investors?: Array<{
    investorId: string;
    amount: number;
    documentUrl: string;
    addedAt?: string;
  }>;
}
