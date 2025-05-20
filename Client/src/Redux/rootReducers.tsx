// reducers/index.js
import { combineReducers } from "@reduxjs/toolkit";
import AuthSlice from "../Redux/ActionSlices/AuthSlice";

const rootReducer = combineReducers({
  AuthSlice: AuthSlice,
});

export default rootReducer;
