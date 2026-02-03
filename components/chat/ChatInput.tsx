import { Mic, Paperclip, Send, Smile } from "lucide-react-native";
import React, { useRef } from "react";
import { Animated, Platform, Pressable, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ChatInputProps {
  isDark: boolean;
  inputText: string;
  uploading: boolean;
  isRecording: boolean;
  keyboardVisible: boolean;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onAttach: () => void;
  onEmoji: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

const RippleButton: React.FC<{
  onPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}> = ({ onPress, onPressIn, onPressOut, children, disabled }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    onPressIn?.();
    Animated.spring(scale, {
      toValue: 0.92,
      useNativeDriver: true,
      friction: 6,
    }).start();
  };

  const handlePressOut = () => {
    onPressOut?.();
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

export const ChatInput: React.FC<ChatInputProps> = ({
  isDark,
  inputText,
  uploading,
  isRecording,
  keyboardVisible,
  onChangeText,
  onSend,
  onAttach,
  onEmoji,
  onStartRecording,
  onStopRecording,
}) => {
  const insets = useSafeAreaInsets();

  const paddingBottom =
    Platform.OS === "ios"
      ? keyboardVisible
        ? 8
        : Math.max(insets.bottom, 8)
      : 12;

  return (
    <View className="relative overflow-hidden">
      <View className={`absolute inset-0 ${isDark ? "" : "bg-white/80"}`} />

      <View
        className={`absolute inset-0 ${
          isDark
            ? "bg-gradient-to-t from-neutral-800/50 via-neutral-850/30 to-neutral-900/60"
            : "bg-gradient-to-t from-white/70 via-neutral-50/40 to-neutral-100/50"
        }`}
      />

      <View
        className={`absolute inset-0 ${
          isDark ? "bg-neutral-900/20" : "bg-white/30"
        }`}
      />

      <View
        className={`absolute top-0 left-0 right-0 h-px ${
          isDark
            ? "bg-gradient-to-r from-transparent via-white/20 to-transparent"
            : "bg-gradient-to-r from-transparent via-neutral-500/30 to-transparent"
        }`}
      />

      <View className="relative px-4" style={{ paddingBottom, paddingTop: 12 }}>
        <View className="flex-row items-center gap-3">
          <View className="flex-1 relative overflow-hidden rounded-[28px]">
            <View
              className={`absolute inset-0 ${
                isDark ? "bg-neutral-800/40" : "bg-gray-100/60"
              }`}
            />

            <View
              className={`absolute inset-0 ${
                isDark
                  ? "bg-gradient-to-br from-neutral-700/20 to-neutral-800/30"
                  : "bg-gradient-to-br from-white/40 to-gray-50/30"
              }`}
            />

            <View className="flex-row items-center relative">
              <RippleButton onPress={onEmoji} disabled={uploading}>
                <View className="w-12 h-12 items-center justify-center">
                  <Smile
                    size={26}
                    color={
                      uploading
                        ? isDark
                          ? "#404040"
                          : "#d1d5db"
                        : isDark
                          ? "#8e8e93"
                          : "#8e8e93"
                    }
                    strokeWidth={2}
                  />
                </View>
              </RippleButton>

              <TextInput
                className={`flex-1 text-[16px] py-3 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
                placeholder="Message"
                placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                value={inputText}
                onChangeText={onChangeText}
                multiline
                autoCapitalize="sentences"
                autoCorrect={true}
                editable={!uploading}
                style={{
                  maxHeight: 100,
                  minHeight: 24,
                  paddingTop: Platform.OS === "ios" ? 10 : 8,
                  paddingBottom: Platform.OS === "ios" ? 10 : 8,
                }}
              />

              <RippleButton onPress={onAttach} disabled={uploading}>
                <View className="w-12 h-12 items-center justify-center">
                  <Paperclip
                    size={26}
                    color={
                      uploading
                        ? isDark
                          ? "#404040"
                          : "#d1d5db"
                        : isDark
                          ? "#8e8e93"
                          : "#8e8e93"
                    }
                    strokeWidth={2}
                  />
                </View>
              </RippleButton>
            </View>
          </View>

          {inputText.trim() ? (
            <RippleButton onPress={onSend} disabled={uploading}>
              <View
                className={`w-12 h-12 rounded-full items-center justify-center ${
                  uploading
                    ? isDark
                      ? "bg-gray-700/50"
                      : "bg-gray-300/50"
                    : isDark
                      ? "bg-blue-600"
                      : "bg-blue-500"
                }`}
              >
                <Send
                  size={22}
                  color="#ffffff"
                  fill="#ffffff"
                  strokeWidth={0}
                  style={{ marginLeft: 2, marginBottom: 1 }}
                />
              </View>
            </RippleButton>
          ) : (
            <RippleButton
              onPressIn={onStartRecording}
              onPressOut={onStopRecording}
              disabled={uploading}
            >
              <View className="w-12 h-12 items-center justify-center">
                <Mic
                  size={28}
                  color={
                    uploading
                      ? isDark
                        ? "#404040"
                        : "#d1d5db"
                      : isDark
                        ? "#8e8e93"
                        : "#8e8e93"
                  }
                  strokeWidth={2}
                />
              </View>
            </RippleButton>
          )}
        </View>
      </View>
    </View>
  );
};
