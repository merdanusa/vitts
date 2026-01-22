import { login, register } from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [loginValue, setLoginValue] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      let result;

      if (isSignUp) {
        if (!name.trim()) throw new Error("Name is required");
        if (!loginValue.trim()) throw new Error("Username is required");
        if (password.length < 6)
          throw new Error("Password must be at least 6 characters");
        if (email.trim() && !email.includes("@"))
          throw new Error("Please enter a valid email");

        result = await register({
          name: name.trim(),
          login: loginValue.trim(),
          ...(email.trim() && { email: email.trim() }),
          password,
        });
      } else {
        if (!loginValue.trim()) throw new Error("Login is required");
        if (!password) throw new Error("Password is required");

        result = await login({
          login: loginValue.trim(),
          password,
        });
      }

      await AsyncStorage.setItem("token", result.token);
      router.replace("/(tabs)");
    } catch (err: any) {
      let message = "Something went wrong. Please try again.";

      if (err.response) {
        const status = err.response.status;
        const backendMsg = err.response.data?.message;

        if (status === 409) {
          message = backendMsg || "Username, email or phone already in use";
        } else if (status === 401) {
          message = "Incorrect login or password";
        } else if (status === 400) {
          message = backendMsg || "Invalid input";
        } else {
          message = backendMsg || "Server error – please try again later";
        }
      } else if (err.message) {
        message = err.message;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError("");
    setName("");
    setLoginValue("");
    setEmail("");
    setPassword("");
    setShowPassword(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          className="px-6"
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-10 items-center">
            <Text className="text-4xl font-bold text-black mb-2">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </Text>
            <Text className="text-base text-gray-600 text-center">
              {isSignUp ? "Sign up to get started" : "Sign in to continue"}
            </Text>
          </View>

          <View className="w-full">
            {isSignUp && (
              <View className="mb-5">
                <Text className="text-sm font-semibold text-black mb-2">
                  Name
                </Text>
                <TextInput
                  className="h-12 bg-gray-100 rounded-xl px-4 text-base text-black border border-gray-200 focus:border-blue-500"
                  value={name}
                  onChangeText={setName}
                  placeholder="John Doe"
                  placeholderTextColor="#999"
                  autoCapitalize="words"
                />
              </View>
            )}

            <View className="mb-5">
              <Text className="text-sm font-semibold text-black mb-2">
                {isSignUp ? "Username" : "Login"}
              </Text>
              <TextInput
                className="h-12 bg-gray-100 rounded-xl px-4 text-base text-black border border-gray-200 focus:border-blue-500"
                value={loginValue}
                onChangeText={setLoginValue}
                placeholder="username"
                placeholderTextColor="#999"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {isSignUp && (
              <View className="mb-5">
                <Text className="text-sm font-semibold text-black mb-2">
                  Email (optional)
                </Text>
                <TextInput
                  className="h-12 bg-gray-100 rounded-xl px-4 text-base text-black border border-gray-200 focus:border-blue-500"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="email@example.com"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            )}

            <View className="mb-6 relative">
              <Text className="text-sm font-semibold text-black mb-2">
                Password
              </Text>
              <TextInput
                className="h-12 bg-gray-100 rounded-xl px-4 text-base text-black border border-gray-200 focus:border-blue-500 pr-16"
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                className="absolute right-4 top-9"
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 20, bottom: 20, left: 40, right: 40 }}
              >
                <Text className="text-blue-600 font-medium text-base">
                  {showPassword ? "Hide" : "Show"}
                </Text>
              </TouchableOpacity>
            </View>

            {error ? (
              <Text className="text-red-600 text-sm mb-4 text-center">
                {error}
              </Text>
            ) : null}

            <TouchableOpacity
              className={`h-12 bg-blue-600 rounded-xl items-center justify-center ${loading ? "opacity-70" : ""}`}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text className="text-white text-base font-semibold">
                  {isSignUp ? "Sign Up" : "Sign In"}
                </Text>
              )}
            </TouchableOpacity>

            <View className="flex-row justify-center items-center mt-6 gap-1">
              <Text className="text-sm text-gray-600">
                {isSignUp
                  ? "Already have an account?"
                  : "Don't have an account?"}
              </Text>
              <TouchableOpacity onPress={toggleMode} activeOpacity={0.7}>
                <Text className="text-sm text-blue-600 font-semibold">
                  {isSignUp ? "Sign In" : "Sign Up"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
