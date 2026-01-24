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
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <View
          style={{
            backgroundColor: isDark ? "#000000" : "#ffffff",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingBottom: 40,
          }}
        >
          <View
            className="px-4 py-4 border-b"
            style={{ borderBottomColor: isDark ? "#262626" : "#dbdbdb" }}
          >
            <Text
              style={{ color: isDark ? "#ffffff" : "#000000" }}
              className="text-xl font-bold"
            >
              Settings
            </Text>
          </View>

          <View className="px-4 py-4">
            <Text
              style={{ color: isDark ? "#ffffff" : "#000000" }}
              className="text-base font-semibold mb-3"
            >
              Theme
            </Text>

            <TouchableOpacity
              onPress={() => onThemeChange("light")}
              style={{
                backgroundColor:
                  currentThemeMode === "light"
                    ? "#3b82f6"
                    : isDark
                      ? "#262626"
                      : "#f3f4f6",
                marginBottom: 8,
              }}
              className="flex-row items-center p-4 rounded-lg"
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
                        ? "#ffffff"
                        : "#000000",
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
                    ? "#3b82f6"
                    : isDark
                      ? "#262626"
                      : "#f3f4f6",
                marginBottom: 8,
              }}
              className="flex-row items-center p-4 rounded-lg"
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
                        ? "#ffffff"
                        : "#000000",
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
                    ? "#3b82f6"
                    : isDark
                      ? "#262626"
                      : "#f3f4f6",
                marginBottom: 8,
              }}
              className="flex-row items-center p-4 rounded-lg"
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
                        ? "#ffffff"
                        : "#000000",
                }}
                className="ml-3 text-base font-medium"
              >
                System
              </Text>
            </TouchableOpacity>
          </View>

          <View className="px-4 mt-4">
            <TouchableOpacity
              onPress={onLogout}
              style={{ backgroundColor: "#ef4444" }}
              className="p-4 rounded-lg items-center"
            >
              <Text className="text-white text-base font-semibold">Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
