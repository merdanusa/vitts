import { getCurrentUser } from "@/services/api";
import { setUser } from "@/store/userSlice";
import * as SecureStore from "expo-secure-store";

export const bootstrapAuth = async (dispatch: any): Promise<boolean> => {
  try {
    const token = await SecureStore.getItemAsync("userToken");

    if (!token) {
      return false;
    }

    const user = await getCurrentUser();

    dispatch(setUser(user));
    return true;
  } catch (err: any) {
    console.warn("Auth bootstrap failed:", err);
    await SecureStore.deleteItemAsync("userToken");
    return false;
  }
};
