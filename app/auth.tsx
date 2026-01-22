import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const API_BASE = "http://localhost:4000";

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const heightAnim = useRef(new Animated.Value(0)).current;

  const toggleMode = () => {
    if (loading) return;

    Keyboard.dismiss();
    setError(null);

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsLogin((prev) => !prev);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(heightAnim, {
          toValue: isLogin ? 1 : 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    });
  };

  const handleAuth = async () => {
    if (loading) return;

    const trimmedLogin = login.trim();
    const trimmedPassword = password.trim();
    const trimmedName = name.trim();

    if (!trimmedLogin || !trimmedPassword) {
      setError("Username and password required");
      return;
    }

    if (!isLogin && !trimmedName) {
      setError("Name is required");
      return;
    }

    if (trimmedPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const body = isLogin
        ? { login: trimmedLogin, password: trimmedPassword }
        : { name: trimmedName, login: trimmedLogin, password: trimmedPassword };

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok && data.token && data.user) {
        await AsyncStorage.setItem("token", data.token);
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
        router.replace("/(tabs)");
      } else {
        setError(data.message || "Authentication failed");
      }
    } catch (err) {
      setError("Connection failed. Check your network");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black" edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 justify-center px-6 py-8">
            <Animated.View style={{ opacity: fadeAnim }}>
              <Text className="text-white text-4xl font-bold mb-2">
                {isLogin ? "Welcome back" : "Create account"}
              </Text>
              <Text className="text-gray-400 text-base mb-10">
                {isLogin ? "Sign in to continue" : "Join Vitts Chat today"}
              </Text>

              {error ? (
                <View className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                  <Text className="text-red-400 text-sm text-center">
                    {error}
                  </Text>
                </View>
              ) : null}

              <View className="gap-3">
                {!isLogin ? (
                  <View className="bg-zinc-900 rounded-2xl border border-zinc-800">
                    <TextInput
                      placeholder="Full name"
                      placeholderTextColor="#6b7280"
                      value={name}
                      onChangeText={(text) => {
                        setName(text);
                        if (error) setError(null);
                      }}
                      className="px-5 py-4 text-white text-base"
                      autoCapitalize="words"
                      editable={!loading}
                    />
                  </View>
                ) : null}

                <View className="bg-zinc-900 rounded-2xl border border-zinc-800">
                  <TextInput
                    placeholder="Username"
                    placeholderTextColor="#6b7280"
                    value={login}
                    onChangeText={(text) => {
                      setLogin(text);
                      if (error) setError(null);
                    }}
                    className="px-5 py-4 text-white text-base"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                  />
                </View>

                <View className="bg-zinc-900 rounded-2xl border border-zinc-800">
                  <TextInput
                    placeholder="Password"
                    placeholderTextColor="#6b7280"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (error) setError(null);
                    }}
                    className="px-5 py-4 text-white text-base"
                    secureTextEntry
                    autoCapitalize="none"
                    editable={!loading}
                    onSubmitEditing={handleAuth}
                    returnKeyType="done"
                  />
                </View>
              </View>

              <TouchableOpacity
                onPress={handleAuth}
                disabled={loading}
                className={`rounded-2xl mt-8 py-4 items-center ${
                  loading ? "bg-blue-600/50" : "bg-blue-600"
                }`}
                activeOpacity={0.7}
              >
                <Text className="text-white text-base font-semibold">
                  {loading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}
                </Text>
              </TouchableOpacity>

              <View className="flex-row justify-center items-center mt-8">
                <Text className="text-gray-400 text-sm">
                  {isLogin
                    ? "Don't have an account? "
                    : "Already have an account? "}
                </Text>
                <TouchableOpacity onPress={toggleMode} disabled={loading}>
                  <Text className="text-blue-500 text-sm font-semibold">
                    {isLogin ? "Sign Up" : "Sign In"}
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
