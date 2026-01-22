import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect, Stack } from "expo-router";
import { useEffect, useState } from "react";

export default function AppLayout() {
  const [isChecking, setIsChecking] = useState(true);
  const [hasToken, setHasToken] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        setHasToken(!!token);
      } catch {
        setHasToken(false);
      } finally {
        setIsChecking(false);
      }
    })();
  }, []);

  if (isChecking) {
    return null;
  }

  if (!hasToken) {
    return <Redirect href="/auth" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
