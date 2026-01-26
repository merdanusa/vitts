import { onReconnect } from "@/services/api";
import type { RootState } from "@/store";
import NetInfo from "@react-native-community/netinfo";
import { useEffect, useState } from "react";
import { Animated, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

interface NetworkMonitorProps {
  onReconnect?: () => void;
}

export function NetworkMonitor({
  onReconnect: onReconnectCallback,
}: NetworkMonitorProps = {}) {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const [showBanner, setShowBanner] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-100));
  const [opacityAnim] = useState(new Animated.Value(0));
  const isDark = useSelector((state: RootState) => state.theme.isDark);

  useEffect(() => {
    if (showBanner) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showBanner, slideAnim, opacityAnim]);

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
    <SafeAreaView
      edges={["top"]}
      className="absolute top-0 left-0 right-0 z-50"
    >
      <Animated.View
        style={{
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        }}
        className={`mx-3 mt-2 rounded-2xl shadow-lg overflow-hidden ${
          isConnected
            ? isDark
              ? "bg-emerald-600/95"
              : "bg-emerald-500/95"
            : isDark
              ? "bg-red-600/95"
              : "bg-red-500/95"
        }`}
      >
        <View className="px-4 py-3 flex-row items-center justify-center backdrop-blur-xl">
          <View className="w-2 h-2 rounded-full mr-2.5 bg-white/90" />
          <Text className="text-white font-semibold text-[15px] tracking-tight">
            {isConnected ? "Back Online" : "No Internet Connection"}
          </Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}
