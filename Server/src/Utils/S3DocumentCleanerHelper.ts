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
        // Format 1 & 3: bucket-name.s3.region.amazonaws.com/key
        return url.pathname.substring(1); // Remove leading '/'
      } else if (url.hostname.startsWith('s3.')) {
        // Format 2: s3.region.amazonaws.com/bucket-name/key
        const pathParts = url.pathname.substring(1).split('/');
        if (pathParts.length > 1) {
          return pathParts.slice(1).join('/'); // Remove bucket name, keep the rest
        }
      }

      return null;
    } catch (error) {
      console.error('Error extracting S3 key from URL:', s3Url, error);
      return null;
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

      const deleteParams = {
        Bucket: bucketName,
        Key: s3Key,
      };

      await s3.deleteObject(deleteParams).promise();
      console.log(`Successfully deleted from S3: ${s3Key}`);
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
    const updatedUrls = new Set(updatedDocuments.map((doc) => doc.fileUrl));
    return existingDocuments
      .filter((doc) => !updatedUrls.has(doc.fileUrl))
      .map((doc) => doc.fileUrl)
      .filter((url) => url && url.trim() !== '');
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
      if (!existingInvestor.investorId || !existingInvestor.documentUrl) {
        return; // Skip if no ID or document
      }

      const updatedInvestor = updatedInvestorMap.get(existingInvestor.investorId);

      if (!updatedInvestor) {
        // Investor was completely removed
        if (existingInvestor.documentUrl.trim() !== '') {
          documentsToDelete.push(existingInvestor.documentUrl);
        }
      } else if (
        existingInvestor.documentUrl !== updatedInvestor.documentUrl &&
        existingInvestor.documentUrl.trim() !== ''
      ) {
        // Investor's document was changed or removed
        documentsToDelete.push(existingInvestor.documentUrl);
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

      // Check fund documents
      if (existingFund.documents && updateData.existingDocuments) {
        const fundDocsToDelete = this.getDocumentsToDelete(
          existingFund.documents,
          updateData.existingDocuments,
        );
        documentsToDelete.push(...fundDocsToDelete);
      }

      // Check investor documents
      if (existingFund.investors && updateData.investors) {
        const investorDocsToDelete = this.getInvestorDocumentsToDelete(
          existingFund.investors,
          updateData.investors,
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
