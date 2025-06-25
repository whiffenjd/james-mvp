import { Response } from 'express';
import { S3DocumentCleanupHelper } from './S3DocumentCleanerHelper';

// --- Types ---
export interface FundDocument {
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
}

export interface Investor {
  investorId: string;
  name: string;
  amount: number;
  documentUrl?: string;
  documentName?: string;
  addedAt: string;
}

export interface FundCreateRequest {
  fundManagerId: string;
  name: string;
  fundSize: number;
  fundType: string;
  targetGeographies: string;
  targetSectors: string;
  targetMOIC: number;
  targetIRR: number;
  minimumInvestment: number;
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
    investorDocumentMap: { [key: string]: { fileUrl: string; fileName: string } };
  } {
    const fundDocuments: FundDocument[] = [];
    const investorDocumentMap: { [key: string]: { fileUrl: string; fileName: string } } = {};

    if (!files || files.length === 0) {
      return { fundDocuments, investorDocumentMap };
    }

    files.forEach((file) => {
      if (!file?.fieldname || !file?.location) return;
      if (file.fieldname === 'fundDocuments') {
        fundDocuments.push({
          fileName: file.originalname,
          fileUrl: file.location,
          uploadedAt: new Date().toISOString(),
        });
      } else if (file.fieldname.startsWith('investorDocument_')) {
        const investorIndex = file.fieldname.replace('investorDocument_', '');
        investorDocumentMap[investorIndex] = {
          fileUrl: file.location,
          fileName: file.originalname,
        };
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
    fundManagerId: string,
    investorDocumentMap: { [key: string]: { fileUrl: string; fileName: string } },
  ): FundCreateRequest {
    if (!Array.isArray(body.investors)) {
      throw new Error('Investors must be provided as an array.');
    }
    const updatedInvestors: Investor[] = body.investors.map((investor: any, index: number) => {
      if (!investor?.investorId) {
        throw new Error(`Investor at index ${index} is missing 'investorId'`);
      }
      const docInfo = investorDocumentMap[index.toString()] || {};
      return {
        ...investor,
        documentUrl: docInfo.fileUrl || '',
        documentName: docInfo.fileName || '',
      };
    });

    return {
      ...body,
      documents: fundDocuments,
      investors: updatedInvestors,
      fundManagerId,
    };
  }

  /**
   * Builds update data for fund modification with S3 cleanup.
   */
  static async buildUpdateDataWithCleanup(
    body: any,
    existingFund: any,
    newFundDocuments: FundDocument[],
    investorDocumentMap: { [key: string]: { fileUrl: string; fileName: string } },
    s3BucketName: string,
  ): Promise<FundUpdateRequest> {
    // First, handle S3 cleanup before building update data
    await S3DocumentCleanupHelper.cleanupRemovedDocuments(existingFund, body, s3BucketName);

    // Now build the update data
    const updatedData = { ...body };

    // Merge documents - use existingDocuments from frontend if provided, otherwise keep existing
    if (body.existingDocuments && Array.isArray(body.existingDocuments)) {
      // Frontend sent existing documents they want to keep
      updatedData.documents = [...body.existingDocuments, ...newFundDocuments];
    } else {
      // No existing documents specified, keep all existing + add new ones
      const existingDocuments: FundDocument[] = existingFund.documents || [];
      updatedData.documents = [...existingDocuments, ...newFundDocuments];
    }

    // Merge investors
    if (Array.isArray(body.investors)) {
      const existingInvestors: Investor[] = existingFund.investors || [];
      const updatedInvestorIds = body.investors.map((inv: any) => inv.investorId);

      // Keep existing investors not included in the update
      const unchangedInvestors = existingInvestors.filter(
        (existing) => !updatedInvestorIds.includes(existing.investorId),
      );

      // Update incoming investors with new or preserved document data
      const updatedInvestors: Investor[] = body.investors.map((investor: any, index: number) => {
        if (!investor?.investorId) {
          throw new Error(`Investor at index ${index} is missing 'investorId'`);
        }

        const existingInvestor = existingInvestors.find(
          (inv) => inv.investorId === investor.investorId,
        );

        const docInfo = investorDocumentMap[index.toString()] || {};

        return {
          ...investor,
          documentUrl:
            docInfo.fileUrl || existingInvestor?.documentUrl || investor.documentUrl || '',
          documentName:
            docInfo.fileName || existingInvestor?.documentName || investor.documentName || '',
          addedAt: existingInvestor?.addedAt || new Date().toISOString(),
        };
      });

      updatedData.investors = [...unchangedInvestors, ...updatedInvestors];
    }

    // Clean up fields not needed in DB
    delete updatedData.existingDocuments;
    delete updatedData.existingInvestors;

    return updatedData;
  }

  /**
   * Builds update data for fund modification (legacy method without S3 cleanup).
   */
  static buildUpdateData(
    body: any,
    existingFund: any,
    newFundDocuments: FundDocument[],
    investorDocumentMap: { [key: string]: { fileUrl: string; fileName: string } },
  ): FundUpdateRequest {
    const updatedData = { ...body };

    // Merge documents
    const existingDocuments: FundDocument[] = existingFund.documents || [];
    updatedData.documents = [...existingDocuments, ...newFundDocuments];

    // Merge investors
    if (Array.isArray(body.investors)) {
      const existingInvestors: Investor[] = existingFund.investors || [];
      const updatedInvestorIds = body.investors.map((inv: any) => inv.investorId);

      // Keep existing investors not included in the update
      const unchangedInvestors = existingInvestors.filter(
        (existing) => !updatedInvestorIds.includes(existing.investorId),
      );

      // Update incoming investors with new or preserved document data
      const updatedInvestors: Investor[] = body.investors.map((investor: any, index: number) => {
        if (!investor?.investorId) {
          throw new Error(`Investor at index ${index} is missing 'investorId'`);
        }

        const existingInvestor = existingInvestors.find(
          (inv) => inv.investorId === investor.investorId,
        );

        const docInfo = investorDocumentMap[index.toString()] || {};

        return {
          ...investor,
          documentUrl:
            docInfo.fileUrl || existingInvestor?.documentUrl || investor.documentUrl || '',
          documentName:
            docInfo.fileName || existingInvestor?.documentName || investor.documentName || '',
          addedAt: existingInvestor?.addedAt || new Date().toISOString(),
        };
      });

      updatedData.investors = [...unchangedInvestors, ...updatedInvestors];
    }

    // Clean up fields not needed in DB
    delete updatedData.existingDocuments;
    delete updatedData.existingInvestors;

    return updatedData;
  }

  /**
   * Sends success response
   */
  static sendSuccessResponse(
    res: Response,
    message: string,
    statusCode: number = 200,
    data?: any,
  ): Response {
    return res.status(statusCode).json({
      success: true,
      message,
      statusCode,
      data,
    });
  }

  /**
   * Sends error response
   */
  static sendErrorResponse(res: Response, error: string, statusCode: number = 500): Response {
    return res.status(statusCode).json({
      success: false,
      error,
      statusCode,
    });
  }
}
