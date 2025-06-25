// import { createSlice } from "@reduxjs/toolkit";

// const AuthSlice = createSlice({
//   name: "AuthSlice",
//   initialState: {
//     loading: false,
//     error: null,
//   },
//   reducers: {
//     ClientRequest: (state) => {
//       state.loading = true;
//       state.error = null;
//     },
//     // clientSignupSuccess: (state, action) => {
//     //   state.loading = false;
//     //   state.clientSignup = action.payload;
//     //   state.clientSignupDummy = action.payload;
//     // },

//     ClientFailure: (state, action) => {
//       state.loading = false;
//       state.error = action.payload;
//     },
//   },
// });

// export const { ClientRequest, ClientFailure } = AuthSlice.actions;

// export default AuthSlice.reducer;

// src/Redux/ActionSlices/AuthSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import { RESET_STATE } from "../rootReducers";
import { PURGE } from "redux-persist";

const initialState = {
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "AuthSlice",
  initialState,
  reducers: {
    ClientRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    ClientFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(PURGE, () => initialState)
      .addCase(RESET_STATE, () => initialState);
  },
});

export const { ClientRequest, ClientFailure } = authSlice.actions;
export default authSlice.reducer;
