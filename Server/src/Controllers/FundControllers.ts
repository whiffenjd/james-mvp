import { Request, Response } from 'express';
import FundService from '../Services/FundServices';
import { stat } from 'fs';

export default class FundController {
  // Backend Controller Fix
  static async createFund(req: Request, res: Response) {
    try {
      const files = req.files as Express.MulterS3.File[];
      const body = JSON.parse(req.body.data);

      // Separate fund documents from investor documents based on fieldname
      const fundDocuments: any[] = [];
      const investorDocumentMap: { [key: string]: string } = {};

      if (files && files.length > 0) {
        files.forEach((file) => {
          if (file.fieldname === 'fundDocuments') {
            // This is a fund document
            fundDocuments.push({
              fileUrl: file.location,
              uploadedAt: new Date().toISOString(),
            });
          } else if (file.fieldname.startsWith('investorDocument_')) {
            // This is an investor document
            const investorIndex = file.fieldname.replace('investorDocument_', '');
            investorDocumentMap[investorIndex] = file.location;
          }
        });
      }

      // Update investors with their document URLs
      const updatedInvestors = body.investors.map((investor: any, index: number) => ({
        ...investor,
        documentUrl: investorDocumentMap[index.toString()] || '',
      }));

      const fundData = {
        ...body,
        documents: fundDocuments,
        investors: updatedInvestors,
      };

      await FundService.create(fundData);
      res.status(201).json({ message: 'Fund created successfully', statusCode: 201 });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'An unknown error occurred.' });
      }
    }
  }
  // Backend Fix - Updated updateFund method
  static async updateFund(req: Request, res: Response) {
    try {
      const files = req.files as Express.MulterS3.File[];
      const body = req.body.data ? JSON.parse(req.body.data) : req.body;

      // Get existing fund data first
      const existingFund = await FundService.findById(req.params.id);
      if (!existingFund) {
        return res.status(404).json({ error: 'Fund not found' });
      }

      // Separate fund documents from investor documents based on fieldname
      const newFundDocuments: any[] = [];
      const investorDocumentMap: { [key: string]: string } = {};

      if (files && files.length > 0) {
        files.forEach((file) => {
          if (file.fieldname === 'fundDocuments') {
            // This is a fund document
            newFundDocuments.push({
              fileUrl: file.location,
              uploadedAt: new Date().toISOString(),
            });
          } else if (file.fieldname.startsWith('investorDocument_')) {
            // This is an investor document
            const investorIndex = file.fieldname.replace('investorDocument_', '');
            investorDocumentMap[investorIndex] = file.location;
          }
        });
      }

      // Prepare updated data
      let updatedData = { ...body };

      // Merge existing documents with new ones
      const existingDocuments = existingFund.documents || [];
      const allDocuments = [...existingDocuments, ...newFundDocuments];
      updatedData.documents = allDocuments;

      // Handle investors - merge existing with new/updated ones
      if (body.investors && Array.isArray(body.investors)) {
        // Get existing investors that are not being updated
        const existingInvestors = existingFund.investors || [];
        const updatedInvestorIds = body.investors.map((inv: any) => inv.investorId);

        // Keep existing investors that are not in the update request
        const unchangedInvestors = existingInvestors.filter(
          (existingInv: any) => !updatedInvestorIds.includes(existingInv.investorId),
        );

        // Process the investors from the update request
        const updatedInvestors = body.investors.map((investor: any, index: number) => {
          // Check if this investor already exists
          const existingInvestor = existingInvestors.find(
            (existing: any) => existing.investorId === investor.investorId,
          );

          return {
            ...investor,
            // Use new document URL if provided, otherwise keep existing one
            documentUrl:
              investorDocumentMap[index.toString()] ||
              existingInvestor?.documentUrl ||
              investor.documentUrl ||
              '',
          };
        });

        // Combine unchanged existing investors with updated/new investors
        updatedData.investors = [...unchangedInvestors, ...updatedInvestors];
      }

      // Remove temporary fields that shouldn't be stored
      delete updatedData.existingDocuments;
      delete updatedData.existingInvestors;

      const result = await FundService.update(req.params.id, updatedData);
      res.status(201).json({ message: 'Fund updated successfully', statusCode: 201 });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'An unknown error occurred.' });
      }
    }
  }

  static async getAllFunds(req: Request, res: Response) {
    const result = await FundService.getAll();
    res.json(result);
  }
  static async getAllFundsSpecificData(req: Request, res: Response) {
    const result = await FundService.getSpecific();
    res.json(result);
  }
  static async getFundById(req: Request, res: Response) {
    const fundManagerId = req.params?.id;
    const result = await FundService.getById(fundManagerId || '');
    res.json(result);
  }

  static async getManagerFunds(req: Request, res: Response) {
    const result = await FundService.getByManagerId(req.params.managerId);
    res.json(result);
  }
  static async getInvestorsByManager(req: Request, res: Response) {
    try {
      const fundManagerId = req.user?.id;
      if (!fundManagerId) {
        return res.status(400).json({ message: 'Unauthorized' });
      }

      const investors = await FundService.getInvestorsByFundManager(fundManagerId);
      res.status(200).json(investors);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: 'Failed to fetch investors', error: error.message });
      } else {
        res.status(500).json({ message: 'Failed to fetch investors', error: 'Unknown error' });
      }
    }
  }

  static async deleteFund(req: Request, res: Response) {
    try {
      const result = await FundService.delete(req.params.id);
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to delete fund' });
    }
  }
}
