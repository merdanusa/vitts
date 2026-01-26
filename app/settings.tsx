import { logout as apiLogout } from "@/services/api";
import { RootState } from "@/store";
import { setThemeMode } from "@/store/themeSlice";
import { logout as logoutAction } from "@/store/userSlice";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  Lock,
  Monitor,
  Moon,
  Phone,
  Shield,
  Sun,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

type ThemeMode = "light" | "dark" | "system";

export default function SettingsScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const isDark = useSelector((state: RootState) => state.theme.isDark);
  const currentThemeMode = useSelector((state: RootState) => state.theme.mode);
  const user = useSelector((state: RootState) => state.user);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [onlineStatus, setOnlineStatus] = useState(true);
  const [showThemeModal, setShowThemeModal] = useState(false);

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await apiLogout();
            dispatch(logoutAction());
            router.replace("/auth");
          } catch (error) {
            console.error("Logout error:", error);
          }
        },
      },
    ]);
  };

  const handleThemeChange = (mode: ThemeMode) => {
    dispatch(setThemeMode(mode));
    setShowThemeModal(false);
  };

  const getThemeLabel = () => {
    switch (currentThemeMode) {
      case "light":
        return "Light";
      case "dark":
        return "Dark";
      case "system":
        return "System";
      default:
        return "System";
    }
  };

  const settingsSections = [
    {
      title: "Account",
      items: [
        {
          icon: Phone,
          label: "Phone Number",
          onPress: () => router.push("/settings-phone"),
          rightText: user?.phoneNumber ? "Added" : "Add",
        },
        {
          icon: Lock,
          label: "Privacy",
          onPress: () => router.push("/settings-privacy"),
        },
        {
          icon: Shield,
          label: "Security",
          onPress: () => router.push("/settings-security"),
        },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          icon: Bell,
          label: "Notifications",
          rightElement: (
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: "#3f3f46", true: "#3b82f6" }}
              thumbColor="#ffffff"
            />
          ),
        },
        {
          icon:
            currentThemeMode === "light"
              ? Sun
              : currentThemeMode === "dark"
                ? Moon
                : Monitor,
          label: "Appearance",
          onPress: () => setShowThemeModal(true),
          rightText: getThemeLabel(),
        },
      ],
    },
  ];

  return (
    <SafeAreaView
      style={{ backgroundColor: isDark ? "#000000" : "#ffffff" }}
      className="flex-1"
    >
      <View
        className="px-4 py-3 flex-row items-center border-b"
        style={{ borderBottomColor: isDark ? "#27272a" : "#e5e7eb" }}
      >
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color={isDark ? "#ffffff" : "#000000"} />
        </TouchableOpacity>
        <Text
          style={{ color: isDark ? "#ffffff" : "#000000" }}
          className="text-lg font-bold"
        >
          Settings
        </Text>
      </View>

      <ScrollView className="flex-1">
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} className="mt-6">
            <Text
              style={{ color: isDark ? "#a1a1aa" : "#6b7280" }}
              className="text-xs font-semibold px-4 mb-3"
            >
              {section.title}
            </Text>
            <View
              style={{
                backgroundColor: isDark ? "#18181b" : "#ffffff",
                borderTopColor: isDark ? "#27272a" : "#e5e7eb",
                borderBottomColor: isDark ? "#27272a" : "#e5e7eb",
              }}
              className="border-t border-b"
            >
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  onPress={item.onPress}
                  disabled={!item.onPress}
                  activeOpacity={0.7}
                  style={{
                    borderBottomColor: isDark ? "#27272a" : "#e5e7eb",
                  }}
                  className={`flex-row items-center px-4 py-4 ${
                    itemIndex < section.items.length - 1 ? "border-b" : ""
                  }`}
                >
                  <View
                    style={{
                      backgroundColor: isDark ? "#27272a" : "#f3f4f6",
                    }}
                    className="w-8 h-8 rounded-full items-center justify-center mr-3"
                  >
                    <item.icon
                      size={18}
                      color={isDark ? "#a1a1aa" : "#6b7280"}
                    />
                  </View>
                  <Text
                    style={{ color: isDark ? "#ffffff" : "#000000" }}
                    className="flex-1 text-sm font-medium"
                  >
                    {item.label}
                  </Text>
                  {item.rightElement ? (
                    item.rightElement
                  ) : (
                    <View className="flex-row items-center">
                      {item.rightText && (
                        <Text
                          style={{ color: isDark ? "#71717a" : "#9ca3af" }}
                          className="text-sm mr-2"
                        >
                          {item.rightText}
                        </Text>
                      )}
                      <ChevronRight
                        size={20}
                        color={isDark ? "#71717a" : "#9ca3af"}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <View className="mt-8 px-4 pb-8">
          <TouchableOpacity
            onPress={handleLogout}
            className="h-12 rounded-lg items-center justify-center"
            style={{ backgroundColor: isDark ? "#27272a" : "#f3f4f6" }}
          >
            <Text className="text-red-500 font-semibold text-sm">Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={showThemeModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowThemeModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-end"
          onPress={() => setShowThemeModal(false)}
        >
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
              Appearance
            </Text>

            <View className="mb-6">
              <TouchableOpacity
                onPress={() => handleThemeChange("light")}
                style={{
                  backgroundColor:
                    currentThemeMode === "light"
                      ? "#3b82f6"
                      : isDark
                        ? "#18181b"
                        : "#f9fafb",
                  marginBottom: 12,
                }}
                className="flex-row items-center p-4 rounded-xl"
                activeOpacity={0.7}
              >
                <Sun
                  size={22}
                  color={
                    currentThemeMode === "light"
                      ? "#ffffff"
                      : isDark
                        ? "#a1a1aa"
                        : "#6b7280"
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
                onPress={() => handleThemeChange("dark")}
                style={{
                  backgroundColor:
                    currentThemeMode === "dark"
                      ? "#3b82f6"
                      : isDark
                        ? "#18181b"
                        : "#f9fafb",
                  marginBottom: 12,
                }}
                className="flex-row items-center p-4 rounded-xl"
                activeOpacity={0.7}
              >
                <Moon
                  size={22}
                  color={
                    currentThemeMode === "dark"
                      ? "#ffffff"
                      : isDark
                        ? "#a1a1aa"
                        : "#6b7280"
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
                onPress={() => handleThemeChange("system")}
                style={{
                  backgroundColor:
                    currentThemeMode === "system"
                      ? "#3b82f6"
                      : isDark
                        ? "#18181b"
                        : "#f9fafb",
                }}
                className="flex-row items-center p-4 rounded-xl"
                activeOpacity={0.7}
              >
                <Monitor
                  size={22}
                  color={
                    currentThemeMode === "system"
                      ? "#ffffff"
                      : isDark
                        ? "#a1a1aa"
                        : "#6b7280"
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

            <TouchableOpacity
              onPress={() => setShowThemeModal(false)}
              style={{
                backgroundColor: isDark ? "#18181b" : "#f9fafb",
              }}
              className="p-4 rounded-xl"
              activeOpacity={0.7}
            >
              <Text
                style={{ color: "#3b82f6" }}
                className="text-center text-base font-medium"
              >
                Done
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
