import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import { useAppTheme } from "@/hooks/useAppTheme.ts";
import { store } from "@/store";
import { useAppDispatch } from "@/store/hooks.ts";
import { updateSystemTheme } from "@/store/themeSlice";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Appearance } from "react-native";
import { Provider } from "react-redux";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutContent() {
  const [appIsReady, setAppIsReady] = useState(false);
  const dispatch = useAppDispatch();
  const { isDark } = useAppTheme();

  useEffect(() => {
    async function prepare() {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();

    const subscription = Appearance.addChangeListener(() => {
      dispatch(updateSystemTheme());
    });

    return () => subscription.remove();
  }, [dispatch]);

  useEffect(() => {
    if (appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <GluestackUIProvider mode={isDark ? "dark" : "light"}>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="auth" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="modal" options={{ presentation: "modal" }} />
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
