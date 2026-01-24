import { Monitor, Moon, Sun } from "lucide-react-native";
import React from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";

type ThemeMode = "light" | "dark" | "system";

interface SettingsModalProps {
  visible: boolean;
  isDark: boolean;
  currentThemeMode: ThemeMode;
  onClose: () => void;
  onThemeChange: (mode: ThemeMode) => void;
  onLogout: () => void;
}

export function SettingsModal({
  visible,
  isDark,
  currentThemeMode,
  onClose,
  onThemeChange,
  onLogout,
}: SettingsModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/50 justify-end" onPress={onClose}>
        <Pressable
          style={{
            backgroundColor: isDark ? "#000000" : "#ffffff",
          }}
          className="rounded-t-3xl p-6"
          onPress={(e) => e.stopPropagation()}
        >
          <Text
            style={{ color: isDark ? "#ffffff" : "#000000" }}
            className="text-2xl font-bold mb-6"
          >
            Settings
          </Text>

          <Text
            style={{ color: isDark ? "#737373" : "#a1a1aa" }}
            className="text-sm font-medium mb-3"
          >
            Appearance
          </Text>

          <View className="mb-6">
            <TouchableOpacity
              onPress={() => onThemeChange("light")}
              style={{
                backgroundColor:
                  currentThemeMode === "light"
                    ? "#007AFF"
                    : isDark
                      ? "#1a1a1a"
                      : "#f9fafb",
                marginBottom: 8,
              }}
              className="flex-row items-center p-4 rounded-xl"
              activeOpacity={0.7}
            >
              <Sun
                size={20}
                color={
                  currentThemeMode === "light"
                    ? "#ffffff"
                    : isDark
                      ? "#a1a1aa"
                      : "#737373"
                }
              />
              <Text
                style={{
                  color:
                    currentThemeMode === "light"
                      ? "#ffffff"
                      : isDark
                        ? "#a1a1aa"
                        : "#737373",
                }}
                className="ml-3 text-base font-medium"
              >
                Light
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onThemeChange("dark")}
              style={{
                backgroundColor:
                  currentThemeMode === "dark"
                    ? "#007AFF"
                    : isDark
                      ? "#1a1a1a"
                      : "#f9fafb",
                marginBottom: 8,
              }}
              className="flex-row items-center p-4 rounded-xl"
              activeOpacity={0.7}
            >
              <Moon
                size={20}
                color={
                  currentThemeMode === "dark"
                    ? "#ffffff"
                    : isDark
                      ? "#a1a1aa"
                      : "#737373"
                }
              />
              <Text
                style={{
                  color:
                    currentThemeMode === "dark"
                      ? "#ffffff"
                      : isDark
                        ? "#a1a1aa"
                        : "#737373",
                }}
                className="ml-3 text-base font-medium"
              >
                Dark
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onThemeChange("system")}
              style={{
                backgroundColor:
                  currentThemeMode === "system"
                    ? "#007AFF"
                    : isDark
                      ? "#1a1a1a"
                      : "#f9fafb",
              }}
              className="flex-row items-center p-4 rounded-xl"
              activeOpacity={0.7}
            >
              <Monitor
                size={20}
                color={
                  currentThemeMode === "system"
                    ? "#ffffff"
                    : isDark
                      ? "#a1a1aa"
                      : "#737373"
                }
              />
              <Text
                style={{
                  color:
                    currentThemeMode === "system"
                      ? "#ffffff"
                      : isDark
                        ? "#a1a1aa"
                        : "#737373",
                }}
                className="ml-3 text-base font-medium"
              >
                System
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => {
              onClose();
              onLogout();
            }}
            style={{
              backgroundColor: isDark ? "#1a1a1a" : "#f9fafb",
            }}
            className="p-4 rounded-xl"
            activeOpacity={0.7}
          >
            <Text
              style={{ color: isDark ? "#a1a1aa" : "#737373" }}
              className="text-center text-base font-medium"
            >
              Logout
            </Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
