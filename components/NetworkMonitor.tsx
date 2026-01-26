import { onReconnect } from "@/services/api";
import NetInfo from "@react-native-community/netinfo";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface NetworkMonitorProps {
  onReconnect?: () => void;
}

export function NetworkMonitor({
  onReconnect: onReconnectCallback,
}: NetworkMonitorProps = {}) {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected =
        state.isConnected && state.isInternetReachable !== false;

      if (connected !== isConnected) {
        setIsConnected(connected);

        if (connected) {
          console.log("[Network] Connection restored");
          setShowBanner(true);
          setTimeout(() => setShowBanner(false), 3000);
        } else {
          console.log("[Network] Connection lost");
          setShowBanner(true);
        }
      }
    });

    let unsubscribeReconnect: (() => void) | undefined;
    if (onReconnectCallback) {
      unsubscribeReconnect = onReconnect(onReconnectCallback);
    }

    return () => {
      unsubscribe();
      unsubscribeReconnect?.();
    };
  }, [isConnected, onReconnectCallback]);

  if (!showBanner) {
    return null;
  }

  return (
    <SafeAreaView>
      <View
        style={[
          styles.banner,
          isConnected ? styles.connected : styles.disconnected,
        ]}
      >
        <Text style={styles.text}>
          {isConnected ? "✓ Back online" : "⚠ No internet connection"}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: 12,
    paddingHorizontal: 16,
    zIndex: 9999,
    alignItems: "center",
  },
  connected: {
    backgroundColor: "#10B981",
  },
  disconnected: {
    backgroundColor: "#EF4444",
  },
  text: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
});
