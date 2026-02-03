import AsyncStorage from "@react-native-async-storage/async-storage";
import { configureStore } from "@reduxjs/toolkit";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist";
import chatReducer from "./chatSlice";
import contactReducer from "./contactsSlice";
import themeReducer from "./themeSlice";
import userReducer from "./userSlice";

// Persist config for chat slice
const chatPersistConfig = {
  key: "chat",
  storage: AsyncStorage,
  whitelist: ["chats", "messages", "pendingMessages"], // Only persist these fields
  blacklist: ["typingUsers", "loadingChats", "loadingMessages"], // Don't persist loading states
};

const persistedChatReducer = persistReducer(chatPersistConfig, chatReducer);

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    user: userReducer,
    contacts: contactReducer,
    chat: persistedChatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        ignoredPaths: ["chat.pendingMessages"],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
