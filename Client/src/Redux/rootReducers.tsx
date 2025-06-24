// reducers/index.js
import { combineReducers } from "@reduxjs/toolkit";
import AuthSlice from "../Redux/ActionSlices/AuthSlice";
import investorsReducer from "./features/investors/investorsSlice";
import fundsReducer from "./features/Funds/fundsSlice";

const rootReducer = combineReducers({
  AuthSlice: AuthSlice,
  investors: investorsReducer,
  funds: fundsReducer,
});

export default rootReducer;
