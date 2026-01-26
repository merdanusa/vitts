import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as SecureStore from "expo-secure-store";

interface UserState {
  id: string | null;
  name: string | null;
  login: string | null;
  email: string | null;
  avatar: string | null;
  isOnline: boolean;
  verified: boolean;
  isAuthenticated: boolean;
}

const initialState: UserState = {
  id: null,
  name: null,
  login: null,
  email: null,
  avatar: null,
  isOnline: false,
  verified: false,
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<any>) => {
      const { id, name, login, email, avatar, isOnline, verified } =
        action.payload;
      state.id = id;
      state.name = name;
      state.login = login;
      state.email = email;
      state.avatar = avatar;
      state.isOnline = isOnline;
      state.isAuthenticated = true;
      state.verified = !!verified;
      console.log("User state updated:", state);
    },
    updateUserProfile: (state, action: PayloadAction<Partial<UserState>>) => {
      Object.assign(state, action.payload);
      console.log("User profile updated:", action.payload);
    },
    updateAvatar: (state, action: PayloadAction<string>) => {
      state.avatar = action.payload;
      console.log("Avatar updated:", action.payload);
    },
    logout: () => {
      SecureStore.deleteItemAsync("token");
      return initialState;
    },
  },
});

export const { setUser, updateUserProfile, updateAvatar, logout } =
  userSlice.actions;
export default userSlice.reducer;
