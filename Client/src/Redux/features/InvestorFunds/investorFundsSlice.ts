// src/Redux/features/InvestorFunds/investorFundsSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { PURGE } from 'redux-persist';
import { RESET_STATE } from '../../rootReducers';

interface InvestorFundsState {
  funds: InvestorFundSummary[];
  loading: boolean;
  error: string | null;
}

const initialState: InvestorFundsState = {
  funds: [],
  loading: false,
  error: null
};

const investorFundsSlice = createSlice({
  name: 'investorFunds',
  initialState,
  reducers: {
    setInvestorFunds: (state, action: PayloadAction<InvestorFundSummary[]>) => {
      state.funds = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    resetInvestorFunds: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(PURGE, () => initialState)
      .addCase(RESET_STATE, () => initialState);
  },
});

export const { 
  setInvestorFunds, 
  setLoading, 
  setError,
  resetInvestorFunds
} = investorFundsSlice.actions;

export default investorFundsSlice.reducer;