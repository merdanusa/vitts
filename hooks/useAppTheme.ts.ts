import { RootState } from "@/store";
import { useSelector } from "react-redux";

export const useAppTheme = () => {
  const { isDark, mode } = useSelector((state: RootState) => state.theme);

  const theme = {
    isDark,
    mode,
    colors: {
      background: isDark ? "#000000" : "#ffffff",
      text: isDark ? "#ffffff" : "#000000",
      subtext: isDark ? "#888888" : "#666666",
      inputBg: isDark ? "#1a1a1a" : "#f5f5f5",
      errorBg: isDark ? "#ff555515" : "#ff555510",
      errorText: isDark ? "#ff6b6b" : "#dc2626",
      dotActive: "#007AFF",
      dotInactive: isDark ? "#333333" : "#eeeeee",
      dotCompleted: isDark ? "#555555" : "#cccccc",
      primary: "#007AFF",
      white: "#ffffff",
    },
  };

  return theme;
};
