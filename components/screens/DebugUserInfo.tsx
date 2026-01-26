import { ENV } from "@/configs/env.config";
import { RootState } from "@/store";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";

const API_BASE_URL =
  ENV.EXPO_PUBLIC_API_URL || "https://vittsbackend-production.up.railway.app";

export const DebugUserInfo = () => {
  const user = useSelector((state: RootState) => state.user);
  const [chats, setChats] = useState<any[]>([]);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      const token = await SecureStore.getItem("token");
      console.log("Loading chats with token:", token?.substring(0, 20) + "...");

      const response = await fetch(`${API_BASE_URL}/api/chats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Chats response status:", response.status);

      if (!response.ok) {
        console.error("Failed to load chats:", response.status);
        setChats([]);
        return;
      }

      const data = await response.json();
      console.log("Chats data:", data);
      setChats(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading chats:", error);
      setChats([]);
    }
  };

  const checkAuth = async () => {
    try {
      const token = await SecureStore.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      console.log("Auth check result:", data);
      alert(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("Auth check error:", error);
    }
  };

  return (
    <ScrollView style={{ padding: 20, backgroundColor: "#000" }}>
      <Text
        style={{
          color: "#fff",
          fontSize: 18,
          fontWeight: "bold",
          marginBottom: 10,
        }}
      >
        Debug Info
      </Text>

      <View
        style={{
          backgroundColor: "#1a1a1a",
          padding: 15,
          borderRadius: 8,
          marginBottom: 15,
        }}
      >
        <Text style={{ color: "#22c55e", fontWeight: "bold" }}>
          Redux User ID:
        </Text>
        <Text style={{ color: "#fff", fontFamily: "monospace" }}>
          {user.id || "NULL"}
        </Text>

        <Text style={{ color: "#22c55e", fontWeight: "bold", marginTop: 10 }}>
          Name:
        </Text>
        <Text style={{ color: "#fff" }}>{user.name || "NULL"}</Text>

        <Text style={{ color: "#22c55e", fontWeight: "bold", marginTop: 10 }}>
          Login:
        </Text>
        <Text style={{ color: "#fff" }}>{user.login || "NULL"}</Text>
      </View>

      <TouchableOpacity
        onPress={checkAuth}
        style={{
          backgroundColor: "#007AFF",
          padding: 15,
          borderRadius: 8,
          marginBottom: 15,
        }}
      >
        <Text
          style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}
        >
          Check Auth Token
        </Text>
      </TouchableOpacity>

      <Text
        style={{
          color: "#fff",
          fontSize: 16,
          fontWeight: "bold",
          marginBottom: 10,
        }}
      >
        Your Chats: ({chats.length})
      </Text>

      {chats.length === 0 ? (
        <Text style={{ color: "#737373", fontStyle: "italic" }}>
          No chats found
        </Text>
      ) : (
        chats.map((chat, index) => (
          <View
            key={index}
            style={{
              backgroundColor: "#1a1a1a",
              padding: 15,
              borderRadius: 8,
              marginBottom: 10,
            }}
          >
            <Text style={{ color: "#22c55e", fontWeight: "bold" }}>
              Chat ID:
            </Text>
            <Text
              style={{ color: "#fff", fontFamily: "monospace", fontSize: 10 }}
            >
              {chat.id}
            </Text>

            <Text
              style={{ color: "#22c55e", fontWeight: "bold", marginTop: 5 }}
            >
              Other User:
            </Text>
            <Text style={{ color: "#fff" }}>{chat.participant?.name}</Text>
            <Text
              style={{ color: "#fff", fontFamily: "monospace", fontSize: 10 }}
            >
              {chat.participant?.id}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
};
