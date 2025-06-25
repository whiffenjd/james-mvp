import AWS from 'aws-sdk';

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export class S3DocumentCleanupHelper {
  static extractS3KeyFromUrl(s3Url: string): string | null {
    try {
      const url = new URL(s3Url);

      if (url.hostname.includes('.s3.')) {
        // Decode URL components to handle spaces (%20) etc.
        return decodeURIComponent(url.pathname.substring(1));
      } else if (url.hostname.startsWith('s3.')) {
        const pathParts = url.pathname.substring(1).split('/');
        if (pathParts.length > 1) {
          return decodeURIComponent(pathParts.slice(1).join('/'));
        }
      }
      return null;
    } catch (error) {
      console.error('Error extracting S3 key from URL:', s3Url, error);
      return null;
    }
  }

  /**
   * Check if a URL is a valid S3 URL
   */
  static isValidS3Url(url: string): boolean {
    if (!url || url.trim() === '') {
      return false;
    }

    try {
      const urlObj = new URL(url);
      return urlObj.hostname.includes('.s3.') || urlObj.hostname.startsWith('s3.');
    } catch {
      return false;
    }
  }

  /**
   * Deletes a single document from S3
   */
  static async deleteFromS3(s3Url: string, bucketName: string): Promise<boolean> {
    try {
      const s3Key = this.extractS3KeyFromUrl(s3Url);
      if (!s3Key) {
        console.error('Could not extract S3 key from URL:', s3Url);
        return false;
      }

      // Add debug logs

      const deleteParams = {
        Bucket: bucketName,
        Key: s3Key,
      };

      await s3.deleteObject(deleteParams).promise();

      return true;
    } catch (error) {
      console.error(`Failed to delete from S3: ${s3Url}`, error);
      return false;
    }
  }

  /**
   * Deletes multiple documents from S3
   */
  static async deleteMultipleFromS3(s3Urls: string[], bucketName: string): Promise<void> {
    const deletePromises = s3Urls.map((url) => this.deleteFromS3(url, bucketName));
    await Promise.allSettled(deletePromises);
  }

  /**
   * Compares existing documents with updated documents and returns URLs to delete
   */
  static getDocumentsToDelete(
    existingDocuments: FundDocument[],
    updatedDocuments: FundDocument[],
  ): string[] {
    // Create a set of URLs that will remain in the database
    const updatedUrls = new Set(
      updatedDocuments.map((doc) => doc.fileUrl).filter((url) => this.isValidS3Url(url)),
    );

    // Find existing S3 URLs that are not in the updated list
    return existingDocuments
      .map((doc) => doc.fileUrl)
      .filter((url) => this.isValidS3Url(url) && !updatedUrls.has(url));
  }

  /**
   * Compares existing investor documents with updated investor documents
   */
  static getInvestorDocumentsToDelete(
    existingInvestors: Investor[],
    updatedInvestors: Investor[],
  ): string[] {
    const documentsToDelete: string[] = [];

    // Create a map of updated investors by investorId
    const updatedInvestorMap = new Map<string, Investor>();
    updatedInvestors.forEach((investor) => {
      if (investor.investorId) {
        updatedInvestorMap.set(investor.investorId, investor);
      }
    });

    // Check each existing investor
    existingInvestors.forEach((existingInvestor) => {
      if (!existingInvestor.investorId || !this.isValidS3Url(existingInvestor.documentUrl || '')) {
        return; // Skip if no ID or not a valid S3 URL
      }

      const updatedInvestor = updatedInvestorMap.get(existingInvestor.investorId);

      if (!updatedInvestor) {
        // Investor was completely removed - delete their document
        documentsToDelete.push(existingInvestor.documentUrl!);
      } else {
        // Check if the document URL changed or was removed
        const existingDocUrl = existingInvestor.documentUrl || '';
        const updatedDocUrl = updatedInvestor.documentUrl || '';

        // If existing had a valid S3 URL but updated doesn't have the same valid S3 URL
        if (this.isValidS3Url(existingDocUrl) && existingDocUrl !== updatedDocUrl) {
          documentsToDelete.push(existingDocUrl);
        }
      }
    });

    return documentsToDelete;
  }

  /**
   * Main method to handle document cleanup during fund update
   */
  static async cleanupRemovedDocuments(
    existingFund: any,
    updateData: any,
    bucketName: string,
  ): Promise<void> {
    try {
      const documentsToDelete: string[] = [];
      const normalizeDoc = (doc: any): FundDocument => {
        if (typeof doc === 'string') {
          const urlParts = doc.split('/');
          const fileName = urlParts[urlParts.length - 1].split('?')[0];
          return {
            fileName: decodeURIComponent(fileName),
            fileUrl: doc,
            uploadedAt: new Date().toISOString(),
          };
        }
        return {
          fileName: doc.fileName || 'Unknown',
          fileUrl: doc.fileUrl || doc.url || '',
          uploadedAt: doc.uploadedAt || new Date().toISOString(),
        };
      };

      // Prepare the final documents that will be in the database after update
      let finalFundDocuments: FundDocument[] = [];
      if (updateData.existingDocuments && Array.isArray(updateData.existingDocuments)) {
        updateData.existingDocuments.forEach((doc: any) => {
          finalFundDocuments.push(normalizeDoc(doc));
        });
      } else {
        // Keep all existing docs if none specified
        (existingFund.documents || []).forEach((doc: any) => {
          finalFundDocuments.push(normalizeDoc(doc));
        });
      }

      // Add new documents
      (updateData.documents || []).forEach((doc: any) => {
        finalFundDocuments.push(normalizeDoc(doc));
      });

      // Normalize existing fund documents for comparison
      const existingDocsNormalized: FundDocument[] = [];
      (existingFund.documents || []).forEach((doc: any) => {
        existingDocsNormalized.push(normalizeDoc(doc));
      });

      // Compare normalized documents
      const updatedUrls = new Set(
        finalFundDocuments.map((doc) => doc.fileUrl).filter((url) => this.isValidS3Url(url)),
      );

      existingDocsNormalized.forEach((doc) => {
        if (this.isValidS3Url(doc.fileUrl) && !updatedUrls.has(doc.fileUrl)) {
          documentsToDelete.push(doc.fileUrl);
        }
      });
      if (updateData.existingDocuments && Array.isArray(updateData.existingDocuments)) {
        // Frontend specified which existing documents to keep
        finalFundDocuments = updateData.existingDocuments.map((doc: any) => {
          if (typeof doc === 'string') {
            return {
              fileName: 'Unknown File',
              fileUrl: doc,
              uploadedAt: new Date().toISOString(),
            };
          }
          return doc;
        });
      } else {
        // No existing documents specified, keep all existing
        finalFundDocuments = existingFund.documents || [];
      }
      const updatedInvestorMap = new Map<string, any>();
      (updateData.investors || []).forEach((inv: any) => {
        if (inv.investorId) {
          updatedInvestorMap.set(inv.investorId, inv);
        }
      });

      // Check each existing investor
      (existingFund.investors || []).forEach((existingInvestor: any) => {
        if (!existingInvestor.investorId) return;

        const updatedInvestor = updatedInvestorMap.get(existingInvestor.investorId);
        const existingDocUrl = existingInvestor.documentUrl || '';

        // 1. Investor was completely removed
        if (!updatedInvestor) {
          if (this.isValidS3Url(existingDocUrl)) {
            documentsToDelete.push(existingDocUrl);
          }
        }
        // 2. Investor exists but document changed
        else {
          const updatedDocUrl = updatedInvestor.documentUrl || '';

          // Only delete if URL changed and it's a valid S3 URL
          if (existingDocUrl !== updatedDocUrl && this.isValidS3Url(existingDocUrl)) {
            documentsToDelete.push(existingDocUrl);
          }
        }
      });

      // Prepare final investors that will be in the database after update
      let finalInvestors: Investor[] = [];

      if (updateData.investors && Array.isArray(updateData.investors)) {
        // Process the investors that are being updated
        const existingInvestors = existingFund.investors || [];
        const updatedInvestorIds = updateData.investors.map((inv: any) => inv.investorId);

        // Keep existing investors not included in the update
        const unchangedInvestors = existingInvestors.filter(
          (existing: any) => !updatedInvestorIds.includes(existing.investorId),
        );

        // Add the updated investors
        finalInvestors = [...unchangedInvestors, ...updateData.investors];
      } else {
        // No investors in update, keep existing
        finalInvestors = existingFund.investors || [];
      }

      // Check investor documents for cleanup
      if (existingFund.investors && Array.isArray(existingFund.investors)) {
        const investorDocsToDelete = this.getInvestorDocumentsToDelete(
          existingFund.investors,
          finalInvestors,
        );
        documentsToDelete.push(...investorDocsToDelete);
      }

      // Delete documents from S3
      if (documentsToDelete.length > 0) {
        console.log(`Deleting ${documentsToDelete.length} documents from S3:`, documentsToDelete);
        await this.deleteMultipleFromS3(documentsToDelete, bucketName);
      } else {
        console.log('No documents to delete from S3');
      }
    } catch (error) {
      console.error('Error during document cleanup:', error);
      // Don't throw error here as we don't want to fail the update if S3 cleanup fails
    }
  }
}
