import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as SecureStore from "expo-secure-store";

interface UserState {
  id: string | null;
  name: string | null;
  login: string | null;
  email: string | null;
  phoneNumber: string | null;
  avatar: string | null;
  isOnline: boolean;
  verified: boolean;
  isAuthenticated: boolean;
  bio: string | null;
  birthday: string | null;
}

const initialState: UserState = {
  id: null,
  name: null,
  login: null,
  email: null,
  phoneNumber: null,
  avatar: null,
  isOnline: false,
  verified: false,
  isAuthenticated: false,
  bio: null,
  birthday: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<any>) => {
      const {
        id,
        _id,
        name,
        login,
        email,
        phoneNumber,
        avatar,
        isOnline,
        verified,
        bio,
        birthday,
      } = action.payload;

      const userId = id || _id;

      console.log("[USER SLICE] setUser called with payload:", action.payload);
      console.log("[USER SLICE] Extracted userId:", userId);

      state.id = userId;
      state.name = name;
      state.login = login;
      state.email = email;
      state.phoneNumber = phoneNumber || null;
      state.avatar = avatar;
      state.isOnline = isOnline;
      state.isAuthenticated = true;
      state.verified = !!verified;
      state.bio = bio || null;
      state.birthday = birthday || null;

      console.log("[USER SLICE] User state updated:", {
        id: state.id,
        name: state.name,
        login: state.login,
        isAuthenticated: state.isAuthenticated,
      });
    },
    updateUserProfile: (state, action: PayloadAction<Partial<UserState>>) => {
      Object.assign(state, action.payload);
      console.log("[USER SLICE] User profile updated:", action.payload);
    },
    updateAvatar: (state, action: PayloadAction<string>) => {
      state.avatar = action.payload;
      console.log("[USER SLICE] Avatar updated:", action.payload);
    },
    updatePhoneNumber: (state, action: PayloadAction<string | null>) => {
      state.phoneNumber = action.payload;
      console.log("[USER SLICE] Phone number updated:", action.payload);
    },
    logout: () => {
      console.log("[USER SLICE] Logging out - clearing user state");
      SecureStore.deleteItemAsync("token");
      return initialState;
    },
  },
});

export const {
  setUser,
  updateUserProfile,
  updateAvatar,
  updatePhoneNumber,
  logout,
} = userSlice.actions;

export default userSlice.reducer;
