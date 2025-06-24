import { Response } from 'express';

// --- Types ---
export interface FundDocument {
  fileUrl: string;
  uploadedAt: string;
}

export interface Investor {
  investorId: string;
  name: string;
  amount: number;
  documentUrl?: string;
  addedAt: string;
}

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
  fundDescription: string;
  investors: Investor[];
  documents: FundDocument[];
  [key: string]: any;
}

export interface FundUpdateRequest extends FundCreateRequest {
  existingDocuments?: FundDocument[];
  existingInvestors?: Investor[];
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  statusCode: number;
  data?: any;
}

// --- Helper Class ---
export class FundCreationUpdateHelper {
  /**
   * Parses the raw request body (string or object) and returns parsedBody and validationError.
   */
  static parseRequestBody(rawData: string | object): {
    parsedBody: any;
    validationError: string | null;
  } {
    if (!rawData) {
      return {
        parsedBody: null,
        validationError: 'Missing fund data in request body.',
      };
    }
    try {
      const parsedBody = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
      return { parsedBody, validationError: null };
    } catch (parseError) {
      return {
        parsedBody: null,
        validationError: 'Invalid JSON format in request body.',
      };
    }
  }

  /**
   * Validates that investors is an array.
   */
  static validateInvestors(investors: any): string | null {
    if (!investors || !Array.isArray(investors)) {
      return 'Investors must be provided as an array.';
    }
    return null;
  }

  /**
   * Processes uploaded files and categorizes them as fund or investor documents.
   */
  static processUploadedFiles(files: Express.MulterS3.File[] | undefined): {
    fundDocuments: FundDocument[];
    investorDocumentMap: { [key: string]: string };
  } {
    const fundDocuments: FundDocument[] = [];
    const investorDocumentMap: { [key: string]: string } = {};

    if (!files || files.length === 0) {
      return { fundDocuments, investorDocumentMap };
    }

    files.forEach((file) => {
      if (!file?.fieldname || !file?.location) return;
      if (file.fieldname === 'fundDocuments') {
        fundDocuments.push({
          fileUrl: file.location,
          uploadedAt: new Date().toISOString(),
        });
      } else if (file.fieldname.startsWith('investorDocument_')) {
        const investorIndex = file.fieldname.replace('investorDocument_', '');
        investorDocumentMap[investorIndex] = file.location;
      }
    });

    return { fundDocuments, investorDocumentMap };
  }

  /**
   * Builds fund data for creation.
   */
  static buildFundData(
    body: any,
    fundDocuments: FundDocument[],
    investorDocumentMap: { [key: string]: string },
  ): FundCreateRequest {
    if (!Array.isArray(body.investors)) {
      throw new Error('Investors must be provided as an array.');
    }
    const updatedInvestors: Investor[] = body.investors.map((investor: any, index: number) => {
      if (!investor?.investorId) {
        throw new Error(`Investor at index ${index} is missing 'investorId'`);
      }
      return {
        ...investor,
        documentUrl: investorDocumentMap[index.toString()] || '',
      };
    });

    return {
      ...body,
      documents: fundDocuments,
      investors: updatedInvestors,
    };
  }

  /**
   * Builds update data for fund modification.
   */
  static buildUpdateData(
    body: any,
    existingFund: any,
    newFundDocuments: FundDocument[],
    investorDocumentMap: { [key: string]: string },
  ): FundUpdateRequest {
    const updatedData = { ...body };

    // Merge documents
    const existingDocuments = existingFund.documents || [];
    updatedData.documents = [...existingDocuments, ...newFundDocuments];

    // Merge investors
    if (Array.isArray(body.investors)) {
      const existingInvestors = existingFund.investors || [];
      const updatedInvestorIds = body.investors.map((inv: any) => inv.investorId);

      // Keep existing investors not being updated
      const unchangedInvestors = existingInvestors.filter(
        (existing: any) => !updatedInvestorIds.includes(existing.investorId),
      );

      // Process updated investors
      const updatedInvestors: Investor[] = body.investors.map((investor: any, index: number) => {
        if (!investor?.investorId) {
          throw new Error(`Investor at index ${index} is missing 'investorId'`);
        }
        const existingInvestor = existingInvestors.find(
          (existing: any) => existing.investorId === investor.investorId,
        );
        return {
          ...investor,
          documentUrl:
            investorDocumentMap[index.toString()] ||
            existingInvestor?.documentUrl ||
            investor.documentUrl ||
            '',
        };
      });

      updatedData.investors = [...unchangedInvestors, ...updatedInvestors];
    }

    // Clean up temporary fields
    delete updatedData.existingDocuments;
    delete updatedData.existingInvestors;

    return updatedData;
  }

  /**
   * Sends a success response.
   */
  static sendSuccessResponse(
    res: Response,
    message: string,
    statusCode: number,
    data?: any,
  ): Response {
    const response: ApiResponse = {
      success: true,
      message,
      statusCode,
      ...(data && { data }),
    };
    return res.status(statusCode).json(response);
  }

  /**
   * Sends an error response.
   */
  static sendErrorResponse(res: Response, error: string, statusCode: number): Response {
    const response: ApiResponse = {
      success: false,
      error,
      statusCode,
    };
    return res.status(statusCode).json(response);
  }
}
