import { configureStore } from "@reduxjs/toolkit";
import currentProjectReducer from "./Slices/activeProjectSlice";

export const store = configureStore({
  reducer: {
    currentProject:currentProjectReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
