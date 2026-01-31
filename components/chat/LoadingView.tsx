import React, { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface LoadingViewProps {
  isDark: boolean;
}

export const LoadingView: React.FC<LoadingViewProps> = ({ isDark }) => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
  const scale1 = useRef(new Animated.Value(1)).current;
  const scale2 = useRef(new Animated.Value(1)).current;
  const scale3 = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const createAnimation = (
      dot: Animated.Value,
      scaleVal: Animated.Value,
      delay: number,
    ) => {
      return Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(dot, {
              toValue: 1,
              duration: 400,
              delay,
              easing: Easing.bezier(0.4, 0, 0.2, 1),
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: 0,
              duration: 400,
              easing: Easing.bezier(0.4, 0, 0.2, 1),
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(scaleVal, {
              toValue: 1.2,
              duration: 400,
              delay,
              easing: Easing.bezier(0.4, 0, 0.2, 1),
              useNativeDriver: true,
            }),
            Animated.timing(scaleVal, {
              toValue: 1,
              duration: 400,
              easing: Easing.bezier(0.4, 0, 0.2, 1),
              useNativeDriver: true,
            }),
          ]),
        ]),
      );
    };

    const animations = Animated.parallel([
      createAnimation(dot1, scale1, 0),
      createAnimation(dot2, scale2, 150),
      createAnimation(dot3, scale3, 300),
    ]);

    animations.start();

    return () => animations.stop();
  }, []);

  const dots = [
    { anim: dot1, scale: scale1 },
    { anim: dot2, scale: scale2 },
    { anim: dot3, scale: scale3 },
  ];

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-[#0a0a0a]" : "bg-white"}`}>
      <View className="flex-1 items-center justify-center">
        <View className="flex-row items-center gap-2">
          {dots.map((dot, index) => (
            <Animated.View
              key={index}
              className={`w-3 h-3 rounded-full ${isDark ? "bg-blue-500" : "bg-[#0088cc]"}`}
              style={{
                opacity: dot.anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 1],
                }),
                transform: [
                  { scale: dot.scale },
                  {
                    translateY: dot.anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -8],
                    }),
                  },
                ],
              }}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};
  