import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import { useAppTheme } from "@/hooks/useAppTheme.ts";
import { store } from "@/store";
import { updateSystemTheme } from "@/store/themeSlice";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Appearance } from "react-native";
import { Provider, useDispatch } from "react-redux";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutContent() {
  const dispatch = useDispatch();
  const { colors, isDark } = useAppTheme();

  useEffect(() => {
    const subscription = Appearance.addChangeListener(() => {
      dispatch(updateSystemTheme());
    });
    return () => subscription.remove();
  }, []);

  return (
    <GluestackUIProvider mode={isDark ? "dark" : "light"}>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="auth" />
          <Stack.Screen name="(tabs)" />
        </Stack>
        <StatusBar style={isDark ? "light" : "dark"} />
      </QueryClientProvider>
    </GluestackUIProvider>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <RootLayoutContent />
    </Provider>
  );
}
