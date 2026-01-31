import { configureStore } from "@reduxjs/toolkit";
import contactReducer from "./contactsSlice";
import groupsReducer from "./groupsSlice";
import themeReducer from "./themeSlice";
import userReducer from "./userSlice";

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    user: userReducer,
    contacts: contactReducer,
    groups: groupsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [],
        ignoredPaths: [],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
