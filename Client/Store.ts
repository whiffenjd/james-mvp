// // store.ts
// import { configureStore } from "@reduxjs/toolkit";
// import type { ThunkAction } from "@reduxjs/toolkit";
// // import rootReducer from "./src/Redux/rootReducers";
// import { persistReducer, persistStore } from "redux-persist";
// import storage from "redux-persist/lib/storage"; // Default storage (localStorage for web)
// import type { Action } from "redux";
// import { rootReducer } from "./src/Redux/rootReducers";

// const persistConfig = {
//   key: "root", // Key to store the data in localStorage
//   storage,
//   whitelist: ["AuthSlice"], // Specify slices to persist (e.g., authentication data)
// };

// const persistedReducer = persistReducer(persistConfig, rootReducer);

// const store = configureStore({
//   reducer: persistedReducer,
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware({
//       serializableCheck: false, // Disable serializable checks for redux-persist
//     }),
// });

// export const persistor = persistStore(store);

// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;
// export type AppThunk<ReturnType = void> = ThunkAction<
//   ReturnType,
//   RootState,
//   unknown,
//   Action<string>
// >;

// export default store;

// store.ts
import { configureStore } from "@reduxjs/toolkit";
import type { ThunkAction, Action } from "@reduxjs/toolkit";
import { rootReducer } from "./src/Redux/rootReducers";

// Create store without persistence
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      // You can now enable serializable checks since we removed redux-persist
      serializableCheck: true,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

export default store;