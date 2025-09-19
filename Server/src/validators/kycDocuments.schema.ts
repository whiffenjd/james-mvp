import { z } from 'zod';

export const GetKycDocumentsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  status: z
    .enum(['pending_upload', 'submitted', 'under_review', 'approved', 'reupload_requested'])
    .optional(),
  investorName: z.string().optional(),
});

export const UpdateKycDocumentsSchema = z.object({
  id: z.string().uuid(),
  formData: z
    .object({
      investorType: z.enum(['individual', 'entity']),
      kycDocumentUrl: z.string().url().optional(),
      proofOfAddressUrl: z.string().url().optional(),
      entityDocuments: z.array(z.object({ url: z.string().url(), type: z.string() })).optional(),
    })
    .refine(
      (data) => {
        if (data.investorType === 'individual') {
          return data.kycDocumentUrl && data.proofOfAddressUrl;
        }
        return data.entityDocuments && data.entityDocuments.length > 0;
      },
      { message: 'Required documents missing for investor type' },
    ),
});

export const RequestReuploadSchema = z.object({
  reuploadNote: z.string().min(1, 'Reupload note is required'),
});

export const DownloadDocumentSchema = z.object({
  docType: z.enum(['kyc', 'proofOfAddress', 'entityDocument']),
});
