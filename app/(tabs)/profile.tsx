import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { getCurrentUser, UserProfile } from "@/services/api"; // adjust path if needed
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, SafeAreaView, View } from "react-native";

const ProfileScreen = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getCurrentUser();
        setUser(data);
      } catch (err: any) {
        setError("Failed to load profile");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" color="#007AFF" />
      </SafeAreaView>
    );
  }

  if (error || !user) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text style={{ color: "#ff6b6b", fontSize: 16 }}>
          {error || "No profile data"}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <VStack space="lg" style={{ padding: 24, alignItems: "center" }}>
        <View
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: "#333",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
            borderWidth: 3,
            borderColor: user.isOnline ? "#34C759" : "#555",
          }}
        >
          {user.avatar && user.avatar !== "M" ? (
            <Image
              source={{ uri: user.avatar }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          ) : (
            <Text style={{ fontSize: 48, color: "#fff", fontWeight: "bold" }}>
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </Text>
          )}
        </View>

        <VStack space="xs" style={{ alignItems: "center" }}>
          <Text style={{ fontSize: 28, fontWeight: "700", color: "#fff" }}>
            {user.name}
          </Text>
          <HStack space="sm" style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 16, color: "#aaa" }}>@{user.login}</Text>
            {user.isOnline && (
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: "#34C759",
                }}
              />
            )}
          </HStack>
        </VStack>

        {user.bio && user.bio !== "Hey there! I use this app." && (
          <Text
            style={{
              fontSize: 16,
              color: "#ccc",
              textAlign: "center",
              paddingHorizontal: 32,
              lineHeight: 24,
            }}
          >
            {user.bio}
          </Text>
        )}

        <VStack space="md" style={{ width: "100%", marginTop: 32 }}>
          <HStack
            justifyContent="space-between"
            style={{
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: "#333",
            }}
          >
            <Text style={{ color: "#aaa", fontSize: 16 }}>Email</Text>
            <Text style={{ color: "#fff", fontSize: 16 }}>
              {user.email || "Not set"}
            </Text>
          </HStack>

          <HStack
            justifyContent="space-between"
            style={{
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: "#333",
            }}
          >
            <Text style={{ color: "#aaa", fontSize: 16 }}>Member since</Text>
            <Text style={{ color: "#fff", fontSize: 16 }}>
              {new Date(user.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </HStack>
        </VStack>
      </VStack>
    </SafeAreaView>
  );
};

export default ProfileScreen;
