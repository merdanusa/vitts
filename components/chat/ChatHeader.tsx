import { getUserStatus } from "@/services/api";
import { getInitials } from "@/utils/helpers";
import { getOnlineStatus } from "@/utils/lastSeen";
import { ChevronLeft, MoreVertical, Phone, Video } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, Image, Pressable, Text, View } from "react-native";

interface ChatHeaderProps {
  isDark: boolean;
  participant: any;
  isTyping: boolean;
  initialIsOnline?: boolean;
  initialLastSeen?: string | null;
  onBack: () => void;
  onProfilePress: () => void;
  onVoiceCall?: () => void;
  onVideoCall?: () => void;
  onSearch?: () => void;
  onMoreOptions?: () => void;
}

const TypingIndicator: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    const createDotAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: -6,
            duration: 400,
            delay,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 400,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ]),
      );
    };

    animationRef.current = Animated.parallel([
      createDotAnimation(dot1, 0),
      createDotAnimation(dot2, 150),
      createDotAnimation(dot3, 300),
    ]);

    animationRef.current.start();

    return () => {
      // Clean up animation on unmount
      if (animationRef.current) {
        animationRef.current.stop();
      }
      // Reset animated values
      dot1.setValue(0);
      dot2.setValue(0);
      dot3.setValue(0);
    };
  }, []);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
        paddingHorizontal: 4,
      }}
    >
      {[dot1, dot2, dot3].map((dot, index) => (
        <Animated.View
          key={index}
          className="w-1 h-1 rounded-full bg-emerald-500"
          style={{
            transform: [{ translateY: dot }],
          }}
        />
      ))}
    </View>
  );
};

const RippleButton: React.FC<{
  onPress: () => void;
  children: React.ReactNode;
  className?: string;
  size?: "small" | "medium" | "large";
}> = ({ onPress, children, className = "", size = "medium" }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.92,
      useNativeDriver: true,
      friction: 6,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
    }).start();
  };

  const sizeClass = {
    small: "p-1.5",
    medium: "p-2",
    large: "p-2.5",
  }[size];

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        className={`rounded-full ${sizeClass} ${className}`}
        style={{ transform: [{ scale }] }}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
};

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  isDark,
  participant,
  isTyping,
  initialIsOnline = false,
  initialLastSeen = null,
  onBack,
  onProfilePress,
  onVoiceCall,
  onVideoCall,
  onSearch,
  onMoreOptions,
}) => {
  const [isOnline, setIsOnline] = useState(initialIsOnline);
  const [lastSeen, setLastSeen] = useState<string | null>(initialLastSeen);
  const [isLoading, setIsLoading] = useState(false);

  const headerOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!participant?.id) return;

    let isMounted = true;
    let intervalId: NodeJS.Timeout;

    const fetchStatus = async () => {
      try {
        setIsLoading(true);
        const status = await getUserStatus(participant.id);

        if (isMounted) {
          setIsOnline(status.isOnline);
          setLastSeen(status.lastSeen);
        }
      } catch (error) {
        console.error("[ChatHeader] Failed to fetch user status:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchStatus();
    intervalId = setInterval(fetchStatus, 30000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [participant?.id]);

  useEffect(() => {
    if (participant?.isOnline !== undefined) {
      setIsOnline(participant.isOnline);
    }
  }, [participant?.isOnline]);

  const hasAvatar =
    participant?.avatar &&
    participant.avatar.length > 1 &&
    participant.avatar.startsWith("http");
  const initials = participant ? getInitials(participant.name) : "";

  const getStatusText = () => {
    if (isTyping) {
      return null;
    }
    return getOnlineStatus(isOnline, lastSeen);
  };

  const statusText = getStatusText();

  return (
    <View className="relative overflow-hidden">
      <View
        className={`absolute inset-0 ${isDark ? "bg-black/75" : "bg-white/80"}`}
      />

      <View
        className={`absolute inset-0 ${
          isDark
            ? isOnline
              ? "bg-gradient-to-br from-gray-800/50 via-emerald-900/15 to-gray-900/60"
              : "bg-gradient-to-br from-gray-800/50 via-gray-850/30 to-gray-900/60"
            : isOnline
              ? "bg-gradient-to-br from-white/70 via-emerald-100/30 to-gray-100/50"
              : "bg-gradient-to-br from-white/70 via-gray-50/40 to-gray-100/50"
        }`}
      />

      <View
        className={`absolute inset-0 ${
          isDark ? "bg-gray-900/20" : "bg-white/30"
        }`}
      />

      <View
        className={`absolute top-0 left-0 right-0 h-px ${
          isDark ? "bg-white/10" : "bg-black/10"
        }`}
      />

      <View
        className={`absolute bottom-0 left-0 right-0 h-px ${
          isDark
            ? "bg-gradient-to-r from-transparent via-white/20 to-transparent"
            : "bg-gradient-to-r from-transparent via-gray-500/30 to-transparent"
        }`}
      />

      <View className="relative pt-2 pb-3">
        <View className="flex-row items-center justify-between px-3">
          <View className="flex-row items-center flex-1">
            <RippleButton
              onPress={onBack}
              className={`mr-2 ${isDark ? "active:bg-white/10" : "active:bg-black/5"}`}
              size="medium"
            >
              <ChevronLeft
                size={26}
                color={isDark ? "#f9fafb" : "#111827"}
                strokeWidth={2.5}
              />
            </RippleButton>

            <Pressable
              onPress={onProfilePress}
              className="flex-row items-center flex-1 mr-2 active:opacity-80"
            >
              <View className="relative mr-3">
                {isOnline && (
                  <View className="absolute -inset-1 rounded-full bg-emerald-500/20 blur-md" />
                )}

                <View
                  className={`rounded-full p-0.5 ${
                    isOnline
                      ? isDark
                        ? "bg-gradient-to-br from-emerald-400 to-teal-500"
                        : "bg-gradient-to-br from-emerald-500 to-teal-600"
                      : isDark
                        ? "bg-gray-700/50"
                        : "bg-gray-300/50"
                  }`}
                >
                  {hasAvatar ? (
                    <Image
                      source={{ uri: participant.avatar }}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <View
                      className={`w-10 h-10 rounded-full items-center justify-center ${
                        isDark ? "bg-gray-700" : "bg-gray-200"
                      }`}
                    >
                      <Text
                        className={`text-base font-bold ${
                          isDark ? "text-gray-100" : "text-gray-700"
                        }`}
                      >
                        {initials}
                      </Text>
                    </View>
                  )}
                </View>

                {isOnline && (
                  <View className="absolute -bottom-0.5 -right-0.5">
                    <Animated.View
                      className="absolute inset-0 w-4 h-4 rounded-full bg-emerald-400/40"
                      style={{
                        transform: [
                          {
                            scale: headerOpacity.interpolate({
                              inputRange: [0, 1],
                              outputRange: [1, 1.3],
                            }),
                          },
                        ],
                      }}
                    />
                    <View
                      className={`w-4 h-4 rounded-full bg-emerald-500 border-[2.5px] ${
                        isDark ? "border-gray-900" : "border-white"
                      } shadow-lg shadow-emerald-500/50`}
                    />
                  </View>
                )}
              </View>

              <View className="flex-1">
                <Text
                  className={`text-[17px] font-bold tracking-tight leading-5 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                  numberOfLines={1}
                  style={{ letterSpacing: -0.3 }}
                >
                  {participant?.name || "Chat"}
                </Text>

                {isTyping ? (
                  <View className="flex-row items-center mt-0.5">
                    <Text className="text-[13px] text-emerald-500 mr-1 font-semibold tracking-wide">
                      typing
                    </Text>
                    <TypingIndicator isDark={isDark} />
                  </View>
                ) : (
                  <Text
                    className={`text-[13px] font-medium mt-0.5 ${
                      isOnline
                        ? "text-emerald-500"
                        : isDark
                          ? "text-gray-400"
                          : "text-gray-500"
                    }`}
                    numberOfLines={1}
                  >
                    {statusText}
                  </Text>
                )}
              </View>
            </Pressable>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            {onVideoCall && (
              <RippleButton
                onPress={onVideoCall}
                className={`${isDark ? "active:bg-white/10" : "active:bg-black/5"}`}
                size="medium"
              >
                <Video
                  size={22}
                  color={isDark ? "#f9fafb" : "#111827"}
                  strokeWidth={2.2}
                />
              </RippleButton>
            )}

            {onVoiceCall && (
              <RippleButton
                onPress={onVoiceCall}
                className={`${isDark ? "active:bg-white/10" : "active:bg-black/5"}`}
                size="medium"
              >
                <Phone
                  size={21}
                  color={isDark ? "#f9fafb" : "#111827"}
                  strokeWidth={2.2}
                />
              </RippleButton>
            )}

            {onMoreOptions && (
              <RippleButton
                onPress={onMoreOptions}
                className={`${isDark ? "active:bg-white/10" : "active:bg-black/5"}`}
                size="medium"
              >
                <MoreVertical
                  size={22}
                  color={isDark ? "#f9fafb" : "#111827"}
                  strokeWidth={2.2}
                />
              </RippleButton>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};
