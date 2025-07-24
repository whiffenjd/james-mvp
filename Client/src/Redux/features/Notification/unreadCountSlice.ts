// src/Redux/features/Notification/unreadCountSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { PURGE } from "redux-persist";
import { RESET_STATE } from "../../rootReducers";

interface UnreadCountState {
  count: number;
}

const initialState: UnreadCountState = {
  count: 0,
};

const unreadCountSlice = createSlice({
  name: "unreadCount",
  initialState,
  reducers: {
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.count = action.payload;
    },
    resetUnreadCount: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(PURGE, () => initialState)
      .addCase(RESET_STATE, () => initialState);
  },
});

export const { setUnreadCount, resetUnreadCount } = unreadCountSlice.actions;
export default unreadCountSlice.reducer;
