// src/features/investors/investorsSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Investor } from "../../../API/Endpoints/Funds/investors";

interface InvestorsState {
  investors: Investor[];
  loading: boolean;
  error: string | null;
}

const initialState: InvestorsState = {
  investors: [],
  loading: false,
  error: null,
};

const investorsSlice = createSlice({
  name: "investors",
  initialState,
  reducers: {
    setInvestors: (state, action: PayloadAction<Investor[]>) => {
      state.investors = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    resetInvestors: () => initialState,
  },
});

export const { setInvestors, setLoading, setError, resetInvestors } = investorsSlice.actions;
export default investorsSlice.reducer;