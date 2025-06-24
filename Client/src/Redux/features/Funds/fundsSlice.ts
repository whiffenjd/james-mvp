// src/Redux/features/Funds/fundsSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface FundSummary {
  id: string;
  name: string;
  fundType: string;
  fundDescription: string;
  investorCount: number;
  createdAt: string;
}

interface FundDocument {
  fileUrl: string;
  uploadedAt: string;
}

interface FundInvestor {
  investorId: string;
  name: string;
  amount: number;
  documentUrl: string;
  addedAt: string;
}

interface FundDetail {
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
  investors: FundInvestor[];
  documents: FundDocument[];
}

interface FundsState {
  allFunds: FundSummary[];
  currentFund: FundDetail | null;
  loading: boolean;
  error: string | null;
}

const initialState: FundsState = {
  allFunds: [],
  currentFund: null,
  loading: false,
  error: null
};

const fundsSlice = createSlice({
  name: 'funds',
  initialState,
  reducers: {
    setAllFunds: (state, action: PayloadAction<FundSummary[]>) => {
      state.allFunds = action.payload;
    },
    setCurrentFund: (state, action: PayloadAction<FundDetail>) => {
      state.currentFund = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearCurrentFund: (state) => {
      state.currentFund = null;
    }
  }
});

export const { 
  setAllFunds, 
  setCurrentFund, 
  setLoading, 
  setError,
  clearCurrentFund 
} = fundsSlice.actions;

export default fundsSlice.reducer;