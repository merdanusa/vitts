import { NetworkMonitor } from "@/components/NetworkMonitor";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import { useAppTheme } from "@/hooks/useAppTheme.ts";
import { bootstrapAuth } from "@/services/authBootstrap";
import { persistor, store } from "@/store";
import { useAppDispatch } from "@/store/hooks";
import { updateSystemTheme } from "@/store/themeSlice";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Appearance } from "react-native";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const dispatch = useAppDispatch();
  const { isDark } = useAppTheme();

  useEffect(() => {
    async function prepare() {
      try {
        const isLoggedIn = await bootstrapAuth(dispatch);
        await new Promise((resolve) => setTimeout(resolve, 600));
      } catch (e) {
        console.warn(e);
      } finally {
        setIsCheckingAuth(false);
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

  if (!appIsReady || isCheckingAuth) {
    return null;
  }

  return (
    <GluestackUIProvider mode={isDark ? "dark" : "light"}>
      <NetworkMonitor />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack>
      <StatusBar style={isDark ? "light" : "dark"} />
    </GluestackUIProvider>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RootLayoutContent />
      </PersistGate>
    </Provider>
  );
}
