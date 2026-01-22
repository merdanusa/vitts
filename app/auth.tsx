import { login, register } from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AuthScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [step, setStep] = useState<"login" | "signup" | "details">("login");
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [loginValue, setLoginValue] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      if (!loginValue.trim()) throw new Error("Login is required");
      if (!password) throw new Error("Password is required");

      const result = await login({
        login: loginValue.trim(),
        password,
      });

      await AsyncStorage.setItem("token", result.token);
      router.replace("/(tabs)");
    } catch (err: any) {
      let message = "Something went wrong. Please try again.";

      if (err.response) {
        const status = err.response.status;
        const backendMsg = err.response.data?.message;

        if (status === 401) {
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

  const handleSignUpNext = () => {
    setError("");
    if (!email.trim() && !loginValue.trim()) {
      setError("Email or username is required");
      return;
    }
    if (email.trim() && !email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }
    setStep("details");
  };

  const handleSignUpComplete = async () => {
    setError("");
    setLoading(true);

    try {
      if (!name.trim()) throw new Error("Name is required");
      if (!password) throw new Error("Password is required");
      if (password.length < 6)
        throw new Error("Password must be at least 6 characters");

      const result = await register({
        name: name.trim(),
        login: loginValue.trim() || email.trim(),
        ...(email.trim() && { email: email.trim() }),
        password,
      });

      await AsyncStorage.setItem("token", result.token);
      router.replace("/(tabs)");
    } catch (err: any) {
      let message = "Something went wrong. Please try again.";

      if (err.response) {
        const status = err.response.status;
        const backendMsg = err.response.data?.message;

        if (status === 409) {
          message = backendMsg || "Username, email or phone already in use";
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

  const resetForm = () => {
    setError("");
    setName("");
    setLoginValue("");
    setEmail("");
    setPassword("");
    setShowPassword(false);
  };

  const switchToSignUp = () => {
    resetForm();
    setStep("signup");
  };

  const switchToLogin = () => {
    resetForm();
    setStep("login");
  };

  const goBack = () => {
    setError("");
    setStep("signup");
  };

  return (
    <SafeAreaView
      style={{ backgroundColor: isDark ? "#000000" : "#FFFFFF" }}
      className="flex-1"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          className="px-6"
          keyboardShouldPersistTaps="handled"
        >
          <View className="items-center mb-8">
            <Image
              source={require("@/assets/images/app_icon.png")}
              style={{ width: 120, height: 120 }}
              className="rounded-2xl mb-4"
            />
          </View>

          {step === "login" && (
            <View className="w-full">
              <View className="mb-4">
                <View className="mb-12 items-center">
                  <Text
                    style={{ color: isDark ? "#FFFFFF" : "#000000" }}
                    className="text-3xl font-bold mb-1 tracking-tight"
                  >
                    Welcome Back
                  </Text>
                  <Text
                    style={{ color: isDark ? "#8E8E93" : "#6B7280" }}
                    className="text-base text-center"
                  >
                    Sign in to continue
                  </Text>
                </View>

                <TextInput
                  style={{
                    backgroundColor: isDark ? "#1C1C1E" : "#F2F2F7",
                    color: isDark ? "#FFFFFF" : "#000000",
                    borderColor: isDark ? "#38383A" : "transparent",
                  }}
                  className="h-14 rounded-xl px-4 text-base border"
                  value={loginValue}
                  onChangeText={setLoginValue}
                  placeholder="Username or Email"
                  placeholderTextColor={isDark ? "#8E8E93" : "#A1A1A6"}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View className="mb-6 relative">
                <TextInput
                  style={{
                    backgroundColor: isDark ? "#1C1C1E" : "#F2F2F7",
                    color: isDark ? "#FFFFFF" : "#000000",
                    borderColor: isDark ? "#38383A" : "transparent",
                  }}
                  className="h-14 rounded-xl px-4 text-base border pr-20"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password"
                  placeholderTextColor={isDark ? "#8E8E93" : "#A1A1A6"}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  className="absolute right-4 top-4"
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text className="text-[#007AFF] font-medium text-base">
                    {showPassword ? "Hide" : "Show"}
                  </Text>
                </TouchableOpacity>
              </View>

              {error ? (
                <View
                  style={{
                    backgroundColor: isDark ? "#2C1515" : "#FEE2E2",
                  }}
                  className="rounded-xl px-4 py-3 mb-4"
                >
                  <Text
                    style={{ color: isDark ? "#FF6B6B" : "#DC2626" }}
                    className="text-sm text-center"
                  >
                    {error}
                  </Text>
                </View>
              ) : null}

              <TouchableOpacity
                className={`h-14 bg-[#007AFF] rounded-xl items-center justify-center ${loading ? "opacity-60" : ""}`}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.7}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text className="text-white text-base font-semibold">
                    Log In
                  </Text>
                )}
              </TouchableOpacity>

              <View className="flex-row justify-center items-center mt-8 gap-1">
                <Text
                  style={{ color: isDark ? "#8E8E93" : "#6B7280" }}
                  className="text-base"
                >
                  Don not have an account?
                </Text>
                <TouchableOpacity onPress={switchToSignUp} activeOpacity={0.6}>
                  <Text className="text-base text-[#007AFF] font-semibold">
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Sign Up Step 1: Email/Username */}
          {step === "signup" && (
            <View className="w-full">
              <Text
                style={{ color: isDark ? "#FFFFFF" : "#000000" }}
                className="text-2xl font-bold mb-2 text-center"
              >
                Create Account
              </Text>
              <Text
                style={{ color: isDark ? "#8E8E93" : "#6B7280" }}
                className="text-base text-center mb-8"
              >
                Add your email or username
              </Text>

              <View className="mb-4">
                <TextInput
                  style={{
                    backgroundColor: isDark ? "#1C1C1E" : "#F2F2F7",
                    color: isDark ? "#FFFFFF" : "#000000",
                    borderColor: isDark ? "#38383A" : "transparent",
                  }}
                  className="h-14 rounded-xl px-4 text-base border"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email"
                  placeholderTextColor={isDark ? "#8E8E93" : "#A1A1A6"}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View className="mb-6">
                <TextInput
                  style={{
                    backgroundColor: isDark ? "#1C1C1E" : "#F2F2F7",
                    color: isDark ? "#FFFFFF" : "#000000",
                    borderColor: isDark ? "#38383A" : "transparent",
                  }}
                  className="h-14 rounded-xl px-4 text-base border"
                  value={loginValue}
                  onChangeText={setLoginValue}
                  placeholder="Username"
                  placeholderTextColor={isDark ? "#8E8E93" : "#A1A1A6"}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {error ? (
                <View
                  style={{
                    backgroundColor: isDark ? "#2C1515" : "#FEE2E2",
                  }}
                  className="rounded-xl px-4 py-3 mb-4"
                >
                  <Text
                    style={{ color: isDark ? "#FF6B6B" : "#DC2626" }}
                    className="text-sm text-center"
                  >
                    {error}
                  </Text>
                </View>
              ) : null}

              <TouchableOpacity
                className="h-14 bg-[#007AFF] rounded-xl items-center justify-center"
                onPress={handleSignUpNext}
                activeOpacity={0.7}
              >
                <Text className="text-white text-base font-semibold">Next</Text>
              </TouchableOpacity>

              <View className="flex-row justify-center items-center mt-8 gap-1">
                <Text
                  style={{ color: isDark ? "#8E8E93" : "#6B7280" }}
                  className="text-base"
                >
                  Already have an account?
                </Text>
                <TouchableOpacity onPress={switchToLogin} activeOpacity={0.6}>
                  <Text className="text-base text-[#007AFF] font-semibold">
                    Log In
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Sign Up Step 2: Name & Password */}
          {step === "details" && (
            <View className="w-full">
              <TouchableOpacity
                onPress={goBack}
                className="mb-4"
                activeOpacity={0.6}
              >
                <Text className="text-[#007AFF] text-base">← Back</Text>
              </TouchableOpacity>

              <Text
                style={{ color: isDark ? "#FFFFFF" : "#000000" }}
                className="text-2xl font-bold mb-2 text-center"
              >
                Complete Your Profile
              </Text>
              <Text
                style={{ color: isDark ? "#8E8E93" : "#6B7280" }}
                className="text-base text-center mb-8"
              >
                Add your name and password
              </Text>

              <View className="mb-4">
                <TextInput
                  style={{
                    backgroundColor: isDark ? "#1C1C1E" : "#F2F2F7",
                    color: isDark ? "#FFFFFF" : "#000000",
                    borderColor: isDark ? "#38383A" : "transparent",
                  }}
                  className="h-14 rounded-xl px-4 text-base border"
                  value={name}
                  onChangeText={setName}
                  placeholder="Full Name"
                  placeholderTextColor={isDark ? "#8E8E93" : "#A1A1A6"}
                  autoCapitalize="words"
                />
              </View>

              <View className="mb-6 relative">
                <TextInput
                  style={{
                    backgroundColor: isDark ? "#1C1C1E" : "#F2F2F7",
                    color: isDark ? "#FFFFFF" : "#000000",
                    borderColor: isDark ? "#38383A" : "transparent",
                  }}
                  className="h-14 rounded-xl px-4 text-base border pr-20"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password"
                  placeholderTextColor={isDark ? "#8E8E93" : "#A1A1A6"}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  className="absolute right-4 top-4"
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text className="text-[#007AFF] font-medium text-base">
                    {showPassword ? "Hide" : "Show"}
                  </Text>
                </TouchableOpacity>
              </View>

              {error ? (
                <View
                  style={{
                    backgroundColor: isDark ? "#2C1515" : "#FEE2E2",
                  }}
                  className="rounded-xl px-4 py-3 mb-4"
                >
                  <Text
                    style={{ color: isDark ? "#FF6B6B" : "#DC2626" }}
                    className="text-sm text-center"
                  >
                    {error}
                  </Text>
                </View>
              ) : null}

              <TouchableOpacity
                className={`h-14 bg-[#007AFF] rounded-xl items-center justify-center ${loading ? "opacity-60" : ""}`}
                onPress={handleSignUpComplete}
                disabled={loading}
                activeOpacity={0.7}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text className="text-white text-base font-semibold">
                    Sign Up
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
