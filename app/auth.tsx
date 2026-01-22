import { login, register } from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
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

  const [step, setStep] = useState<"login" | 1 | 2 | 3 | 4 | 5>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form values
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Animation
  const animValue = useRef(new Animated.Value(0)).current;

  const fadeIn = () => {
    animValue.setValue(0);
    Animated.timing(animValue, {
      toValue: 1,
      duration: 320,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    fadeIn();
  }, [step]);

  const animatedStyle = {
    opacity: animValue,
    transform: [
      {
        translateY: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        }),
      },
    ],
  };

  const resetForm = () => {
    setError("");
    setEmail("");
    setUsername("");
    setName("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // ── LOGIN ────────────────────────────────────────────────
  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      if (!email.trim() && !username.trim())
        throw new Error("Username or email required");
      if (!password) throw new Error("Password is required");

      const loginPayload = username.trim()
        ? { login: username.trim() }
        : { login: email.trim() };

      const result = await login({
        ...loginPayload,
        password,
      });

      await AsyncStorage.setItem("token", result.token);
      router.replace("/(tabs)");
    } catch (err: any) {
      let message = "Something went wrong. Please try again.";
      if (err.response) {
        const status = err.response.status;
        const backendMsg = err.response.data?.message;
        if (status === 401) message = "Incorrect credentials";
        else if (status === 400) message = backendMsg || "Invalid input";
        else message = backendMsg || "Server error";
      } else if (err.message) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // ── SIGNUP FLOW ──────────────────────────────────────────
  const goNext = () => {
    setError("");
    if (step === 1) {
      if (!email.trim()) return setError("Email is required");
      if (!email.includes("@")) return setError("Invalid email format");
      setStep(2);
    } else if (step === 2) {
      if (!username.trim()) return setError("Username is required");
      if (username.length < 3)
        return setError("Username must be at least 3 characters");
      setStep(3);
    } else if (step === 3) {
      if (!name.trim()) return setError("Full name is required");
      setStep(4);
    } else if (step === 4) {
      if (!password) return setError("Password is required");
      if (password.length < 6)
        return setError("Password must be at least 6 characters");
      setStep(5);
    } else if (step === 5) {
      handleSignUpComplete();
    }
  };

  const goBack = () => {
    setError("");
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
    else if (step === 4) setStep(3);
    else if (step === 5) setStep(4);
  };

  const handleSignUpComplete = async () => {
    setError("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const result = await register({
        name: name.trim(),
        login: username.trim(),
        email: email.trim(),
        password,
      });

      await AsyncStorage.setItem("token", result.token);
      router.replace("/(tabs)");
    } catch (err: any) {
      let message = "Something went wrong.";
      if (err.response) {
        const status = err.response.status;
        const msg = err.response.data?.message;
        if (status === 409) message = msg || "Username or email already taken";
        else if (status === 400) message = msg || "Invalid input";
        else message = msg || "Server error";
      } else if (err.message) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const switchToSignUp = () => {
    resetForm();
    setStep(1);
  };

  const switchToLogin = () => {
    resetForm();
    setStep("login");
  };

  // ── RENDER ───────────────────────────────────────────────
  return (
    <SafeAreaView
      style={{ backgroundColor: isDark ? "#000" : "#fff" }}
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
          <View className="items-center mb-10">
            <Image
              source={require("@/assets/images/app_icon.png")}
              style={{ width: 100, height: 100 }}
              className="rounded-2xl mb-5"
            />
          </View>

          <Animated.View style={[animatedStyle, { flex: 1 }]}>
            {step === "login" && (
              <View className="w-full">
                <View className="mb-10 items-center">
                  <Text
                    style={{ color: isDark ? "#fff" : "#000" }}
                    className="text-3xl font-bold mb-2"
                  >
                    Welcome Back
                  </Text>
                  <Text
                    style={{ color: isDark ? "#999" : "#666" }}
                    className="text-base text-center"
                  >
                    Sign in to continue
                  </Text>
                </View>

                <TextInput
                  style={{
                    backgroundColor: isDark ? "#1C1C1E" : "#F2F2F7",
                    color: isDark ? "#fff" : "#000",
                  }}
                  className="h-14 rounded-xl px-4 mb-4 text-base border border-transparent"
                  value={email || username}
                  onChangeText={(t) => {
                    if (t.includes("@")) setEmail(t);
                    else setUsername(t);
                  }}
                  placeholder="Username or Email"
                  placeholderTextColor={isDark ? "#777" : "#999"}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType={
                    email.includes("@") ? "email-address" : "default"
                  }
                />

                <View className="relative mb-6">
                  <TextInput
                    style={{
                      backgroundColor: isDark ? "#1C1C1E" : "#F2F2F7",
                      color: isDark ? "#fff" : "#000",
                    }}
                    className="h-14 rounded-xl px-4 pr-20 text-base border border-transparent"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Password"
                    placeholderTextColor={isDark ? "#777" : "#999"}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    className="absolute right-4 top-4"
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Text className="text-[#007AFF] font-medium">
                      {showPassword ? "Hide" : "Show"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {error ? (
                  <View className="bg-red-100 dark:bg-red-950/40 rounded-xl px-4 py-3 mb-6">
                    <Text className="text-red-600 dark:text-red-400 text-sm text-center">
                      {error}
                    </Text>
                  </View>
                ) : null}

                <TouchableOpacity
                  className={`h-14 bg-[#007AFF] rounded-xl items-center justify-center ${loading ? "opacity-60" : ""}`}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text className="text-white text-base font-semibold">
                      Log In
                    </Text>
                  )}
                </TouchableOpacity>

                <View className="flex-row justify-center mt-8 gap-1.5">
                  <Text
                    style={{ color: isDark ? "#999" : "#666" }}
                    className="text-base"
                  >
                    Do not have an account?
                  </Text>
                  <TouchableOpacity onPress={switchToSignUp}>
                    <Text className="text-[#007AFF] font-semibold">
                      Sign Up
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {step !== "login" && (
              <View className="w-full">
                <View className="flex-row items-center mb-6">
                  {step > 1 && (
                    <TouchableOpacity onPress={goBack} className="mr-3">
                      <Text className="text-[#007AFF] text-lg">←</Text>
                    </TouchableOpacity>
                  )}
                  <Text
                    style={{ color: isDark ? "#fff" : "#000" }}
                    className="text-2xl font-bold flex-1 text-center"
                  >
                    {step === 1 && "Your Email"}
                    {step === 2 && "Choose Username"}
                    {step === 3 && "Your Name"}
                    {step === 4 && "Create Password"}
                    {step === 5 && "Confirm Password"}
                  </Text>
                </View>

                <Text
                  style={{ color: isDark ? "#aaa" : "#666" }}
                  className="text-center mb-8"
                >
                  Step {step} of 5
                </Text>

                {step === 1 && (
                  <TextInput
                    style={{
                      backgroundColor: isDark ? "#1C1C1E" : "#F2F2F7",
                      color: isDark ? "#fff" : "#000",
                    }}
                    className="h-14 rounded-xl px-4 mb-6 text-base border border-transparent"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Email address"
                    placeholderTextColor={isDark ? "#777" : "#999"}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                )}

                {step === 2 && (
                  <TextInput
                    style={{
                      backgroundColor: isDark ? "#1C1C1E" : "#F2F2F7",
                      color: isDark ? "#fff" : "#000",
                    }}
                    className="h-14 rounded-xl px-4 mb-6 text-base border border-transparent"
                    value={username}
                    onChangeText={setUsername}
                    placeholder="Username"
                    placeholderTextColor={isDark ? "#777" : "#999"}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                )}

                {step === 3 && (
                  <TextInput
                    style={{
                      backgroundColor: isDark ? "#1C1C1E" : "#F2F2F7",
                      color: isDark ? "#fff" : "#000",
                    }}
                    className="h-14 rounded-xl px-4 mb-6 text-base border border-transparent"
                    value={name}
                    onChangeText={setName}
                    placeholder="Full name"
                    placeholderTextColor={isDark ? "#777" : "#999"}
                    autoCapitalize="words"
                  />
                )}

                {step === 4 && (
                  <View className="relative mb-6">
                    <TextInput
                      style={{
                        backgroundColor: isDark ? "#1C1C1E" : "#F2F2F7",
                        color: isDark ? "#fff" : "#000",
                      }}
                      className="h-14 rounded-xl px-4 pr-20 text-base border border-transparent"
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Password"
                      placeholderTextColor={isDark ? "#777" : "#999"}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      className="absolute right-4 top-4"
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Text className="text-[#007AFF] font-medium">
                        {showPassword ? "Hide" : "Show"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {step === 5 && (
                  <View className="relative mb-6">
                    <TextInput
                      style={{
                        backgroundColor: isDark ? "#1C1C1E" : "#F2F2F7",
                        color: isDark ? "#fff" : "#000",
                      }}
                      className="h-14 rounded-xl px-4 pr-20 text-base border border-transparent"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Confirm password"
                      placeholderTextColor={isDark ? "#777" : "#999"}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      className="absolute right-4 top-4"
                      onPress={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      <Text className="text-[#007AFF] font-medium">
                        {showConfirmPassword ? "Hide" : "Show"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {error ? (
                  <View className="bg-red-100 dark:bg-red-950/40 rounded-xl px-4 py-3 mb-6">
                    <Text className="text-red-600 dark:text-red-400 text-sm text-center">
                      {error}
                    </Text>
                  </View>
                ) : null}

                <TouchableOpacity
                  className={`h-14 bg-[#007AFF] rounded-xl items-center justify-center ${loading ? "opacity-60" : ""}`}
                  onPress={goNext}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text className="text-white text-base font-semibold">
                      {step === 5 ? "Create Account" : "Next"}
                    </Text>
                  )}
                </TouchableOpacity>

                <View className="flex-row justify-center mt-8 gap-1.5">
                  <Text
                    style={{ color: isDark ? "#999" : "#666" }}
                    className="text-base"
                  >
                    Already have an account?
                  </Text>
                  <TouchableOpacity onPress={switchToLogin}>
                    <Text className="text-[#007AFF] font-semibold">Log In</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
