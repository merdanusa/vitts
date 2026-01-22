import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
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

  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const toggleMode = () => {
    Keyboard.dismiss();
    setError(null);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: isLogin ? -15 : 15,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsLogin(!isLogin);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleAuth = async () => {
    if (loading) return;

    if (!login.trim() || !password.trim() || (!isLogin && !name.trim())) {
      setError("Please fill all fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const body = isLogin ? { login, password } : { name, login, password };

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        await AsyncStorage.setItem("token", data.token);
        router.replace("/(tabs)");
      } else {
        setError(data.message || "Authentication failed");
      }
    } catch (err) {
      setError("Network error. Check connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black" edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View className="flex-1 justify-center px-6">
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <Text className="text-white text-4xl font-bold mb-2">
              {isLogin ? "Welcome back" : "Create account"}
            </Text>
            <Text className="text-gray-400 text-base mb-10">
              {isLogin ? "Sign in to continue" : "Join Vitts Chat today"}
            </Text>

            {error && (
              <View className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                <Text className="text-red-400 text-sm text-center">
                  {error}
                </Text>
              </View>
            )}

            <View className="gap-3">
              {!isLogin && (
                <View className="bg-zinc-900 rounded-2xl border border-zinc-800">
                  <TextInput
                    placeholder="Full name"
                    placeholderTextColor="#6b7280"
                    value={name}
                    onChangeText={(text) => {
                      setName(text);
                      setError(null);
                    }}
                    className="px-5 py-4 text-white text-base"
                    autoCapitalize="words"
                    editable={!loading}
                  />
                </View>
              )}

              <View className="bg-zinc-900 rounded-2xl border border-zinc-800">
                <TextInput
                  placeholder="Username"
                  placeholderTextColor="#6b7280"
                  value={login}
                  onChangeText={(text) => {
                    setLogin(text);
                    setError(null);
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
                    setError(null);
                  }}
                  className="px-5 py-4 text-white text-base"
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!loading}
                  onSubmitEditing={handleAuth}
                  returnKeyType={isLogin ? "go" : "done"}
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
