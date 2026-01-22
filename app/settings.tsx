import { Button } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import api, { getCurrentUser } from "@/services/api";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface PrivacySettings {
  lastSeen: "everyone" | "contacts" | "nobody";
  profilePhoto: "everyone" | "contacts" | "nobody";
  about: "everyone" | "contacts" | "nobody";
  readReceipts: boolean;
  storyVisibility: "everyone" | "contacts" | "custom";
  onlineStatus: boolean;
  whoCanMessageMe: "everyone" | "contacts" | "nobody";
}

const SettingsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    lastSeen: "everyone",
    profilePhoto: "everyone",
    about: "everyone",
    readReceipts: true,
    storyVisibility: "contacts",
    onlineStatus: true,
    whoCanMessageMe: "contacts",
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      if (user.privacySettings) {
        setPrivacySettings(user.privacySettings as any);
      }
      setIsPrivate(user.isPrivate || false);
    } catch (error) {
      console.error("Failed to load settings:", error);
      Alert.alert("Error", "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: any) => {
    try {
      setSaving(true);
      const payload = { [key]: value };
      await api.patch("/api/users/me/privacy", payload);

      if (key === "isPrivate") {
        setIsPrivate(value);
      } else {
        setPrivacySettings((prev) => ({ ...prev, [key]: value }));
      }
    } catch (error: any) {
      console.error("Failed to update setting:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to update setting",
      );
    } finally {
      setSaving(false);
    }
  };

  const showVisibilityOptions = (
    currentValue: string,
    onSelect: (value: string) => void,
  ) => {
    Alert.alert(
      "Who can see this?",
      "",
      [
        {
          text: "Everyone",
          onPress: () => onSelect("everyone"),
        },
        {
          text: "Contacts",
          onPress: () => onSelect("contacts"),
        },
        {
          text: "Nobody",
          onPress: () => onSelect("nobody"),
        },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true },
    );
  };

  const showStoryVisibilityOptions = (
    currentValue: string,
    onSelect: (value: string) => void,
  ) => {
    Alert.alert(
      "Story Visibility",
      "",
      [
        {
          text: "Everyone",
          onPress: () => onSelect("everyone"),
        },
        {
          text: "Contacts",
          onPress: () => onSelect("contacts"),
        },
        {
          text: "Custom",
          onPress: () => onSelect("custom"),
        },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true },
    );
  };

  const showMessageOptions = (
    currentValue: string,
    onSelect: (value: string) => void,
  ) => {
    Alert.alert(
      "Who can message me?",
      "",
      [
        {
          text: "Everyone",
          onPress: () => onSelect("everyone"),
        },
        {
          text: "Contacts",
          onPress: () => onSelect("contacts"),
        },
        {
          text: "Nobody",
          onPress: () => onSelect("nobody"),
        },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true },
    );
  };

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <VStack space="lg" px="$5" py="$6">
          <Text fontSize="$2xl" fontWeight="$bold" mb="$4">
            Privacy Settings
          </Text>

          <VStack space="md">
            <Text fontWeight="$semibold" fontSize="$lg">
              Account Privacy
            </Text>

            <HStack justifyContent="space-between" alignItems="center">
              <VStack flex={1} mr="$3">
                <Text>Private Account</Text>
                <Text fontSize="$xs" color="$gray500" mt="$1">
                  When your account is private, only people you approve can see
                  your posts and stories.
                </Text>
              </VStack>
              <Switch
                value={isPrivate}
                onValueChange={(value) => updateSetting("isPrivate", value)}
                disabled={saving}
              />
            </HStack>
          </VStack>

          <VStack space="md" mt="$6">
            <Text fontWeight="$semibold" fontSize="$lg">
              Visibility Settings
            </Text>

            <HStack justifyContent="space-between" alignItems="center">
              <Text>Show Online Status</Text>
              <Switch
                value={privacySettings.onlineStatus}
                onValueChange={(value) => updateSetting("onlineStatus", value)}
                disabled={saving}
              />
            </HStack>

            <HStack justifyContent="space-between" alignItems="center">
              <Text>Read Receipts</Text>
              <Switch
                value={privacySettings.readReceipts}
                onValueChange={(value) => updateSetting("readReceipts", value)}
                disabled={saving}
              />
            </HStack>
          </VStack>

          <VStack space="md" mt="$6">
            <Text fontWeight="$semibold" fontSize="$lg">
              Who can see my...
            </Text>

            <TouchableOpacity
              onPress={() =>
                showVisibilityOptions(privacySettings.lastSeen, (value) =>
                  updateSetting("lastSeen", value),
                )
              }
              disabled={saving}
            >
              <HStack justifyContent="space-between" py="$2">
                <Text>Last Seen & Online</Text>
                <HStack alignItems="center" space="xs">
                  <Text color="$blue500">
                    {capitalizeFirst(privacySettings.lastSeen)}
                  </Text>
                  <Text color="$gray400" fontSize="$lg">
                    ›
                  </Text>
                </HStack>
              </HStack>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                showVisibilityOptions(privacySettings.profilePhoto, (value) =>
                  updateSetting("profilePhoto", value),
                )
              }
              disabled={saving}
            >
              <HStack justifyContent="space-between" py="$2">
                <Text>Profile Photo</Text>
                <HStack alignItems="center" space="xs">
                  <Text color="$blue500">
                    {capitalizeFirst(privacySettings.profilePhoto)}
                  </Text>
                  <Text color="$gray400" fontSize="$lg">
                    ›
                  </Text>
                </HStack>
              </HStack>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                showVisibilityOptions(privacySettings.about, (value) =>
                  updateSetting("about", value),
                )
              }
              disabled={saving}
            >
              <HStack justifyContent="space-between" py="$2">
                <Text>Bio / About</Text>
                <HStack alignItems="center" space="xs">
                  <Text color="$blue500">
                    {capitalizeFirst(privacySettings.about)}
                  </Text>
                  <Text color="$gray400" fontSize="$lg">
                    ›
                  </Text>
                </HStack>
              </HStack>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                showStoryVisibilityOptions(
                  privacySettings.storyVisibility,
                  (value) => updateSetting("storyVisibility", value),
                )
              }
              disabled={saving}
            >
              <HStack justifyContent="space-between" py="$2">
                <Text>Stories</Text>
                <HStack alignItems="center" space="xs">
                  <Text color="$blue500">
                    {capitalizeFirst(privacySettings.storyVisibility)}
                  </Text>
                  <Text color="$gray400" fontSize="$lg">
                    ›
                  </Text>
                </HStack>
              </HStack>
            </TouchableOpacity>
          </VStack>

          <VStack space="md" mt="$6">
            <Text fontWeight="$semibold" fontSize="$lg">
              Messaging
            </Text>

            <TouchableOpacity
              onPress={() =>
                showMessageOptions(privacySettings.whoCanMessageMe, (value) =>
                  updateSetting("whoCanMessageMe", value),
                )
              }
              disabled={saving}
            >
              <HStack justifyContent="space-between" py="$2">
                <Text>Who can message me</Text>
                <HStack alignItems="center" space="xs">
                  <Text color="$blue500">
                    {capitalizeFirst(privacySettings.whoCanMessageMe)}
                  </Text>
                  <Text color="$gray400" fontSize="$lg">
                    ›
                  </Text>
                </HStack>
              </HStack>
            </TouchableOpacity>
          </VStack>

          {saving && (
            <HStack justifyContent="center" mt="$4" alignItems="center">
              <ActivityIndicator size="small" color="#007AFF" />
              <Text ml="$2" color="$gray500">
                Saving...
              </Text>
            </HStack>
          )}

          <Button
            mt="$10"
            variant="outline"
            onPress={() => navigation.goBack()}
            width="$full"
          >
            <Text fontWeight="$semibold">Done</Text>
          </Button>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SettingsScreen;
