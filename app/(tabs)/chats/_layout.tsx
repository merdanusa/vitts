import { RootState } from "@/store";
import { Stack } from "expo-router";
import { useSelector } from "react-redux";

export default function ChatsLayout() {
  const isDark = useSelector((state: RootState) => state.theme.isDark);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: isDark ? "#000000" : "#ffffff",
        },
        animation: "slide_from_right",
      }}
    />
  );
}
