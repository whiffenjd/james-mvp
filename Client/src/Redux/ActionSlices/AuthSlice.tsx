import { createSlice } from "@reduxjs/toolkit";

const AuthSlice = createSlice({
  name: "AuthSlice",
  initialState: {
    loading: false,
    error: null,
  },
  reducers: {
    ClientRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    // clientSignupSuccess: (state, action) => {
    //   state.loading = false;
    //   state.clientSignup = action.payload;
    //   state.clientSignupDummy = action.payload;
    // },

    ClientFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { ClientRequest, ClientFailure } = AuthSlice.actions;

export default AuthSlice.reducer;
