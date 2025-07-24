export type DistributionCreate = {
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

export type DistributionUpdate = Partial<DistributionCreate>;

export type ActivityLogCreate = {
  entityType: string;
  entityId: string;
  action: string;
  performedBy: string;
  fundId?: string;
  description?: string;
};

export type Distribution = {
  id: string;
  fundId: string;
  investorId: string;
  createdBy: string;
  amount: string;
  date: string;
  recipientName: string;
  bankName: string;
  accountNumber: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
};
