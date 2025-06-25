// // reducers/index.js
// import { combineReducers } from "@reduxjs/toolkit";
// import AuthSlice from "../Redux/ActionSlices/AuthSlice";
// import investorsReducer from "./features/investors/investorsSlice";
// import fundsReducer from "./features/Funds/fundsSlice";

// const rootReducer = combineReducers({
//   AuthSlice: AuthSlice,
//   investors: investorsReducer,
//   funds: fundsReducer,
// });

// export default rootReducer;

// src/Redux/rootReducers.ts
import { combineReducers } from "@reduxjs/toolkit";
import { PURGE } from "redux-persist";
import investorsReducer from "./features/investors/investorsSlice";
import fundsReducer from "./features/Funds/fundsSlice";
import AuthSlice from "./ActionSlices/AuthSlice";
import investorFundsReducer from "./features/InvestorFunds/investorFundsSlice";

// Create a special reset action type
export const RESET_STATE = "RESET_STATE";

const appReducer = combineReducers({
  AuthSlice,
  investors: investorsReducer,
  funds: fundsReducer,
  investorFunds: investorFundsReducer,
});

export const rootReducer = (state: any, action: any) => {
  // Reset the entire state when either PURGE or RESET_STATE is dispatched
  if (action.type === PURGE || action.type === RESET_STATE) {
    // You can optionally preserve some state if needed
    // const stateToPreserve = { someSlice: state.someSlice };
    // return appReducer({ ...stateToPreserve }, action);

    // Complete reset:
    return appReducer(undefined, action);
  }

  return appReducer(state, action);
};
