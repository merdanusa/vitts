import { Mic, Paperclip, Send, Smile } from "lucide-react-native";
import React from "react";
import { Platform, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ChatInputProps {
  isDark: boolean;
  inputText: string;
  uploading: boolean;
  isRecording: boolean;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onAttach: () => void;
  onEmoji: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  isDark,
  inputText,
  uploading,
  isRecording,
  onChangeText,
  onSend,
  onAttach,
  onEmoji,
  onStartRecording,
  onStopRecording,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        borderTopWidth: 0.5,
        borderTopColor: isDark ? "#1a1a1a" : "#f3f4f6",
        backgroundColor: isDark ? "#000000" : "#ffffff",
        paddingBottom: insets.bottom + 8,
        paddingTop: 8,
      }}
      className="px-4"
    >
      <View className="flex-row items-center">
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={onAttach}
          className="mr-3"
          disabled={uploading}
        >
          <Paperclip
            size={24}
            color={
              uploading
                ? isDark
                  ? "#404040"
                  : "#d1d5db"
                : isDark
                  ? "#ffffff"
                  : "#007AFF"
            }
          />
        </TouchableOpacity>

        <View
          style={{
            backgroundColor: isDark ? "#1a1a1a" : "#f9fafb",
            borderWidth: 0.5,
            borderColor: isDark ? "#262626" : "#e5e7eb",
            flex: 1,
            borderRadius: 20,
            paddingHorizontal: 12,
            paddingVertical: Platform.OS === "ios" ? 10 : 8,
            marginRight: 8,
          }}
          className="flex-row items-center"
        >
          <TextInput
            style={{
              color: isDark ? "#ffffff" : "#000000",
              flex: 1,
              fontSize: 16,
              maxHeight: 100,
              paddingTop: 0,
              paddingBottom: 0,
            }}
            placeholder="Message"
            placeholderTextColor={isDark ? "#737373" : "#a1a1aa"}
            value={inputText}
            onChangeText={onChangeText}
            multiline
            autoCapitalize="sentences"
            autoCorrect={true}
            editable={!uploading}
          />
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={onEmoji}
            className="ml-2"
            disabled={uploading}
          >
            <Smile
              size={22}
              color={
                uploading
                  ? isDark
                    ? "#404040"
                    : "#d1d5db"
                  : isDark
                    ? "#737373"
                    : "#a1a1aa"
              }
            />
          </TouchableOpacity>
        </View>

        {inputText.trim() ? (
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={onSend}
            disabled={uploading}
          >
            <Send size={24} color={uploading ? "#a1a1aa" : "#007AFF"} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            activeOpacity={0.6}
            onPressIn={onStartRecording}
            onPressOut={onStopRecording}
            disabled={uploading}
          >
            <Mic
              size={24}
              color={
                uploading
                  ? isDark
                    ? "#404040"
                    : "#d1d5db"
                  : isDark
                    ? "#ffffff"
                    : "#007AFF"
              }
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
