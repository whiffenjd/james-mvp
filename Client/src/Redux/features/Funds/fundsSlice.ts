// src/Redux/features/Funds/fundsSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { PURGE } from "redux-persist";
import { RESET_STATE } from "../../rootReducers";
import type { InvestorFundSummary } from "../../../API/Endpoints/Funds/funds";

export interface FundSummary {
  id: string;
  name: string;
  fundType: string;
  fundDescription: string;
  investorCount: number;
  createdAt: string;
}

export interface FundDocument {
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

export interface FundDetail {
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
  createdAt: string;
  id: string;
}

export interface FundApiResponse {
  result: FundDetail;
  success: boolean;
  message: string;
}

interface FundsState {
  allFunds: Array<FundSummary | InvestorFundSummary>;
  currentFund: FundApiResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: FundsState = {
  allFunds: [],
  currentFund: null,
  loading: false,
  error: null,
};

const fundsSlice = createSlice({
  name: "funds",
  initialState,
  reducers: {
    setAllFunds: (
      state,
      action: PayloadAction<Array<FundSummary | InvestorFundSummary>>
    ) => {
      state.allFunds = action.payload;
    },
    setCurrentFund: (state, action: PayloadAction<FundApiResponse>) => {
      console.log("current funf set", action.payload);
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
    },
    resetFunds: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(PURGE, () => initialState)
      .addCase(RESET_STATE, () => initialState);
  },
});

export const {
  setAllFunds,
  setCurrentFund,
  setLoading,
  setError,
  clearCurrentFund,
  resetFunds,
} = fundsSlice.actions;

export default fundsSlice.reducer;
