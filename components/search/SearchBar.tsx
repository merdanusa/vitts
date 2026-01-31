import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, TextInput, View } from "react-native";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onCancel?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function SearchBar({
  value,
  onChangeText,
  onCancel,
  placeholder = "Search",
  autoFocus = false,
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onChangeText("");
  };

  const handleCancel = () => {
    onChangeText("");
    setIsFocused(false);
    onCancel?.();
  };

  return (
    <View className="px-4 py-2 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <View className="flex-row items-center">
        {/* Search Input Container */}
        <View
          className={`flex-1 flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 ${
            isFocused ? "border border-blue-500" : ""
          }`}
        >
          <Ionicons
            name="search"
            size={18}
            color={isFocused ? "#3B82F6" : "#9CA3AF"}
            className="mr-2"
          />
          <TextInput
            value={value}
            onChangeText={onChangeText}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            className="flex-1 text-base text-gray-900 dark:text-white ml-2"
            autoFocus={autoFocus}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {value.length > 0 && (
            <Pressable
              onPress={handleClear}
              className="ml-2 w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 items-center justify-center"
            >
              <Ionicons name="close" size={14} color="white" />
            </Pressable>
          )}
        </View>

        {/* Cancel Button (iOS style) */}
        {isFocused && (
          <Pressable onPress={handleCancel} className="ml-3">
            <View>
              <Ionicons name="close-circle" size={24} color="#007AFF" />
            </View>
          </Pressable>
        )}
      </View>
    </View>
  );
}
