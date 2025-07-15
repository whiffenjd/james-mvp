export type CapitalCallCreate = {
  fundId: string;
  investorId: string;
  amount: string;
  date: string;
  recipientName: string;
  bankName: string;
  accountNumber: string;
  description: string;
  createdBy: string;
};

export type ActivityLogCreate = {
  entityType: string;
  entityId: string;
  action: string;
  performedBy: string;
  description?: string;
};
