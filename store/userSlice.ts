import { createSlice, PayloadAction } from "@reduxjs/toolkit";

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
      state.verified = verified;
      state.isAuthenticated = true;
      console.log("User state updated:", state);
    },
    logout: (state) => {
      return initialState;
    },
  },
});

export const { setUser, logout } = userSlice.actions;
export default userSlice.reducer;
