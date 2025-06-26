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
  status: boolean;
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
   * Normalizes document structure to ensure consistent format
   */
  static normalizeDocuments(documents: any[]): FundDocument[] {
    if (!Array.isArray(documents)) {
      return [];
    }

    return documents
      .map((doc) => {
        // If it's just a URL string, convert to proper structure
        if (typeof doc === 'string') {
          // Extract filename from URL
          const urlParts = doc.split('/');
          const fileNameWithParams = urlParts[urlParts.length - 1];
          const fileName = fileNameWithParams.split('?')[0]; // Remove query parameters

          return {
            fileName: decodeURIComponent(fileName),
            fileUrl: doc,
            uploadedAt: new Date().toISOString(),
          };
        }

        // If it's already a proper document object, ensure all required fields
        if (doc && typeof doc === 'object') {
          return {
            fileName: doc.fileName || 'Unknown File',
            fileUrl: doc.fileUrl || doc.url || '',
            uploadedAt: doc.uploadedAt || new Date().toISOString(),
          };
        }

        // Fallback for invalid structures
        return {
          fileName: 'Unknown File',
          fileUrl: '',
          uploadedAt: new Date().toISOString(),
        };
      })
      .filter((doc) => doc.fileUrl !== ''); // Remove documents without URLs
  }

  /**
   * Normalizes investor structure to ensure consistent format
   */
  static normalizeInvestors(investors: any[]): Investor[] {
    if (!Array.isArray(investors)) {
      return [];
    }

    return investors.map((investor) => {
      if (!investor || typeof investor !== 'object') {
        throw new Error('Invalid investor data structure');
      }

      if (!investor.investorId) {
        throw new Error('Investor is missing required investorId field');
      }

      return {
        investorId: investor.investorId,
        status: false,
        name: investor.name || '',
        amount: investor.amount || 0,
        documentUrl: investor.documentUrl || '',
        documentName: investor.documentName || '',
        addedAt: investor.addedAt || new Date().toISOString(),
      };
    });
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
        status: false, // ✅ Add this line to ensure status is included
        documentUrl: docInfo.fileUrl || '',
        documentName: docInfo.fileName || '',
        addedAt: new Date().toISOString(),
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
    // Prepare the update data first so we know what the final state will be
    const updatedData = { ...body };

    // Handle documents - maintain consistent structure
    let finalDocuments: FundDocument[] = [];

    if (body.existingDocuments && Array.isArray(body.existingDocuments)) {
      // Frontend sent existing documents they want to keep - normalize them
      const normalizedExisting = this.normalizeDocuments(body.existingDocuments);
      finalDocuments = [...normalizedExisting, ...newFundDocuments];
    } else {
      // No existing documents specified, keep all existing + add new ones
      const existingDocuments = this.normalizeDocuments(existingFund.documents || []);
      finalDocuments = [...existingDocuments, ...newFundDocuments];
    }

    updatedData.documents = finalDocuments;

    // Handle investors - maintain consistent structure
    let finalInvestors: Investor[] = [];

    if (Array.isArray(body.investors)) {
      // Get existing investors
      const existingInvestors = this.normalizeInvestors(existingFund.investors || []);

      // Create map of existing investors by ID
      const existingInvestorMap = new Map<string, Investor>();
      existingInvestors.forEach((inv) => existingInvestorMap.set(inv.investorId, inv));

      // Process updated investors
      const updatedInvestors: Investor[] = body.investors.map((investor: any, index: number) => {
        if (!investor?.investorId) {
          throw new Error(`Investor at index ${index} is missing 'investorId'`);
        }

        const existingInvestor = existingInvestorMap.get(investor.investorId);
        const docInfo = investorDocumentMap[index.toString()] || {};

        return {
          investorId: investor.investorId,
          status: investor.status,
          name: investor.name || existingInvestor?.name || '',
          amount: investor.amount || existingInvestor?.amount || 0,
          documentUrl:
            docInfo.fileUrl || investor.documentUrl || existingInvestor?.documentUrl || '',
          documentName:
            docInfo.fileName || investor.documentName || existingInvestor?.documentName || '',
          addedAt: existingInvestor?.addedAt || new Date().toISOString(),
        };
      });

      // Only keep investors present in the update request
      finalInvestors = updatedInvestors;
    } else {
      // If no investors provided in update, keep existing ones
      finalInvestors = this.normalizeInvestors(existingFund.investors || []);
    }

    updatedData.investors = finalInvestors;

    // Now perform S3 cleanup with the prepared data
    await S3DocumentCleanupHelper.cleanupRemovedDocuments(existingFund, updatedData, s3BucketName);

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

    // Handle documents - maintain consistent structure
    const existingDocuments = this.normalizeDocuments(existingFund.documents || []);
    updatedData.documents = [...existingDocuments, ...newFundDocuments];

    // Handle investors - maintain consistent structure
    if (Array.isArray(body.investors)) {
      const existingInvestors = this.normalizeInvestors(existingFund.investors || []);
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
          investorId: investor.investorId,
          status: investor.status,
          name: investor.name || existingInvestor?.name || '',
          amount: investor.amount || existingInvestor?.amount || 0,
          documentUrl:
            docInfo.fileUrl || existingInvestor?.documentUrl || investor.documentUrl || '',
          documentName:
            docInfo.fileName || existingInvestor?.documentName || investor.documentName || '',
          addedAt: existingInvestor?.addedAt || new Date().toISOString(),
        };
      });

      updatedData.investors = [...unchangedInvestors, ...updatedInvestors];
    } else {
      // If no investors provided in update, keep existing ones normalized
      updatedData.investors = this.normalizeInvestors(existingFund.investors || []);
    }

    // Clean up fields not needed in DB
    delete updatedData.existingDocuments;
    delete updatedData.existingInvestors;

    return updatedData;
  }

  /**
   * Sends a standardized error response.
   */
  static sendErrorResponse(res: Response, message: string, statusCode: number): Response {
    return res.status(statusCode).json({
      success: false,
      error: message,
      statusCode,
    });
  }

  /**
   * Sends a standardized success response.
   */
  static sendSuccessResponse(
    res: Response,
    message: string,
    statusCode: number,
    data?: any,
  ): Response {
    return res.status(statusCode).json({
      success: true,
      message,
      statusCode,
      data,
    });
  }
}
