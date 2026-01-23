
import { RootState } from "@/store";
import { Redirect, Stack } from "expo-router";
import { useSelector } from "react-redux";

export default function AuthLayout() {
  const isAuthenticated = useSelector(
    (state: RootState) => state.user.isAuthenticated
  );

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Stack />;
}