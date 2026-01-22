  import AsyncStorage from "@react-native-async-storage/async-storage";
  import { router } from "expo-router";
  import React, { useState } from "react";
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

    const slideAnim = React.useRef(new Animated.Value(0)).current;
    const fadeAnim = React.useRef(new Animated.Value(1)).current;

    const toggleMode = () => {
      Keyboard.dismiss();

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: isLogin ? -20 : 20,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsLogin(!isLogin);
        setError(null);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      });
    };

    const handleAuth = async () => {
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

        if (response.ok) {
          await AsyncStorage.setItem("token", data.token);
          router.replace("/");
        } else {
          setError(data.message || "Authentication failed");
        }
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    return (
      <SafeAreaView className="flex-1 bg-black">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 bg-black"
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
              <Text className="text-gray-400 text-base mb-12">
                {isLogin ? "Sign in to continue" : "Join Vitts Chat today"}
              </Text>

              {error && (
                <Text className="text-red-500 text-base mb-6 text-center">
                  {error}
                </Text>
              )}

              <View className="space-y-4">
                {!isLogin && (
                  <View className="bg-zinc-900 rounded-2xl border border-zinc-800">
                    <TextInput
                      placeholder="Full name"
                      placeholderTextColor="#6b7280"
                      value={name}
                      onChangeText={setName}
                      className="px-5 py-4 text-white text-base"
                      autoCapitalize="words"
                    />
                  </View>
                )}

                <View className="bg-zinc-900 rounded-2xl border border-zinc-800">
                  <TextInput
                    placeholder="Username"
                    placeholderTextColor="#6b7280"
                    value={login}
                    onChangeText={setLogin}
                    className="px-5 py-4 text-white text-base"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <View className="bg-zinc-900 rounded-2xl border border-zinc-800">
                  <TextInput
                    placeholder="Password"
                    placeholderTextColor="#6b7280"
                    value={password}
                    onChangeText={setPassword}
                    className="px-5 py-4 text-white text-base"
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <TouchableOpacity
                onPress={handleAuth}
                disabled={loading}
                className="bg-blue-600 rounded-2xl mt-8 py-4 items-center active:bg-blue-700"
                activeOpacity={0.8}
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
                <TouchableOpacity onPress={toggleMode}>
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
