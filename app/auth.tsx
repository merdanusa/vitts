import { login, register } from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
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

const { width } = Dimensions.get("window");
const MAX_FORM_WIDTH = 420;

export default function AuthScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [step, setStep] = useState<"login" | 1 | 2 | 3 | 4 | 5>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const animValue = useRef(new Animated.Value(0)).current;

  const fadeIn = () => {
    animValue.setValue(0);
    Animated.timing(animValue, {
      toValue: 1,
      duration: 340,
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
          outputRange: [30, 0],
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

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      if (!email.trim() && !username.trim())
        throw new Error("Username or email required");
      if (!password.trim()) throw new Error("Password is required");

      const result = await login({
        login: username.trim() || email.trim(),
        password,
      });

      await AsyncStorage.setItem("token", result.token);
      router.replace("/(tabs)");
    } catch (err: any) {
      let message = "Something went wrong.";
      if (err.response) {
        const { status, data } = err.response;
        if (status === 401) message = "Incorrect credentials";
        else if (status === 400) message = data?.message || "Invalid input";
        else message = data?.message || "Server error";
      } else {
        message = err.message || message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const goNext = () => {
    setError("");
    if (step === 1) {
      if (!email.trim()) return setError("Email is required");
      if (!email.includes("@")) return setError("Invalid email");
      setStep(2);
    } else if (step === 2) {
      if (!username.trim()) return setError("Username is required");
      if (username.length < 3) return setError("Min 3 characters");
      setStep(3);
    } else if (step === 3) {
      if (!name.trim()) return setError("Name is required");
      setStep(4);
    } else if (step === 4) {
      if (!password.trim()) return setError("Password is required");
      if (password.length < 6) return setError("Min 6 characters");
      setStep(5);
    } else if (step === 5) {
      handleSignUpComplete();
    }
  };

  const goBack = () => {
    setError("");
    if (step > 1) setStep(((step as number) - 1) as any);
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
        const { status, data } = err.response;
        if (status === 409) message = data?.message || "Username/email taken";
        else if (status === 400) message = data?.message || "Invalid input";
        else message = data?.message || "Server error";
      } else {
        message = err.message || message;
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

  return (
    <SafeAreaView
      style={{ backgroundColor: isDark ? "#000" : "#fff", flex: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: 24,
            paddingVertical: 40,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ alignItems: "center", marginBottom: 32 }}>
            <Image
              source={require("@/assets/images/app_icon.png")}
              style={{ width: 88, height: 88 }}
              className="rounded-3xl mb-6"
            />
          </View>

          <Animated.View
            style={[
              animatedStyle,
              {
                width: "100%",
                maxWidth: MAX_FORM_WIDTH,
                alignSelf: "center",
              },
            ]}
          >
            {step !== "login" && (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  marginBottom: 24,
                  gap: 8,
                }}
              >
                {[1, 2, 3, 4, 5].map((s) => (
                  <View
                    key={s}
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor:
                        s === step
                          ? "#007AFF"
                          : s < (step as number)
                            ? isDark
                              ? "#444"
                              : "#ccc"
                            : isDark
                              ? "#222"
                              : "#eee",
                    }}
                  />
                ))}
              </View>
            )}

            <View style={{ alignItems: "center", marginBottom: 32 }}>
              <Text
                style={{
                  color: isDark ? "#fff" : "#000",
                  fontSize: step === "login" ? 32 : 26,
                  fontWeight: "700",
                  letterSpacing: -0.5,
                  textAlign: "center",
                }}
              >
                {step === "login"
                  ? "Welcome back"
                  : step === 1
                    ? "Your email"
                    : step === 2
                      ? "Choose username"
                      : step === 3
                        ? "Your name"
                        : step === 4
                          ? "Create password"
                          : "Confirm password"}
              </Text>

              <Text
                style={{
                  color: isDark ? "#888" : "#666",
                  fontSize: 16,
                  marginTop: 8,
                  textAlign: "center",
                }}
              >
                {step === "login"
                  ? "Sign in to continue"
                  : step !== 5
                    ? `Step ${step} of 5`
                    : "Make sure they match"}
              </Text>
            </View>

            {step === "login" ? (
              <>
                <TextInput
                  style={{
                    backgroundColor: isDark ? "#111" : "#f8f9fa",
                    color: isDark ? "#fff" : "#000",
                    borderWidth: 1,
                    borderColor: isDark ? "#333" : "#ddd",
                  }}
                  className="h-14 rounded-2xl px-5 mb-4 text-base"
                  value={username || email}
                  onChangeText={(t) => {
                    if (t.includes("@")) setEmail(t);
                    else setUsername(t);
                  }}
                  placeholder="Username or Email"
                  placeholderTextColor={isDark ? "#666" : "#999"}
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                <View className="relative mb-6">
                  <TextInput
                    style={{
                      backgroundColor: isDark ? "#111" : "#f8f9fa",
                      color: isDark ? "#fff" : "#000",
                      borderWidth: 1,
                      borderColor: isDark ? "#333" : "#ddd",
                    }}
                    className="h-14 rounded-2xl px-5 pr-20 text-base"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Password"
                    placeholderTextColor={isDark ? "#666" : "#999"}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    className="absolute right-5 top-4"
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Text className="text-[#007AFF] font-medium text-base">
                      {showPassword ? "Hide" : "Show"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                {step === 1 && (
                  <TextInput
                    style={{
                      backgroundColor: isDark ? "#111" : "#f8f9fa",
                      color: isDark ? "#fff" : "#000",
                      borderWidth: 1,
                      borderColor: isDark ? "#333" : "#ddd",
                    }}
                    className="h-14 rounded-2xl px-5 mb-6 text-base"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Email address"
                    placeholderTextColor={isDark ? "#666" : "#999"}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                )}

                {step === 2 && (
                  <TextInput
                    style={{
                      backgroundColor: isDark ? "#111" : "#f8f9fa",
                      color: isDark ? "#fff" : "#000",
                      borderWidth: 1,
                      borderColor: isDark ? "#333" : "#ddd",
                    }}
                    className="h-14 rounded-2xl px-5 mb-6 text-base"
                    value={username}
                    onChangeText={setUsername}
                    placeholder="Username"
                    placeholderTextColor={isDark ? "#666" : "#999"}
                    autoCapitalize="none"
                  />
                )}

                {step === 3 && (
                  <TextInput
                    style={{
                      backgroundColor: isDark ? "#111" : "#f8f9fa",
                      color: isDark ? "#fff" : "#000",
                      borderWidth: 1,
                      borderColor: isDark ? "#333" : "#ddd",
                    }}
                    className="h-14 rounded-2xl px-5 mb-6 text-base"
                    value={name}
                    onChangeText={setName}
                    placeholder="Full name"
                    placeholderTextColor={isDark ? "#666" : "#999"}
                    autoCapitalize="words"
                  />
                )}

                {step === 4 && (
                  <View className="relative mb-6">
                    <TextInput
                      style={{
                        backgroundColor: isDark ? "#111" : "#f8f9fa",
                        color: isDark ? "#fff" : "#000",
                        borderWidth: 1,
                        borderColor: isDark ? "#333" : "#ddd",
                      }}
                      className="h-14 rounded-2xl px-5 pr-20 text-base"
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Password (min 6)"
                      placeholderTextColor={isDark ? "#666" : "#999"}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      className="absolute right-5 top-4"
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
                        backgroundColor: isDark ? "#111" : "#f8f9fa",
                        color: isDark ? "#fff" : "#000",
                        borderWidth: 1,
                        borderColor: isDark ? "#333" : "#ddd",
                      }}
                      className="h-14 rounded-2xl px-5 pr-20 text-base"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Confirm password"
                      placeholderTextColor={isDark ? "#666" : "#999"}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      className="absolute right-5 top-4"
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
              </>
            )}

            {error ? (
              <View className="bg-red-500/10 rounded-2xl px-5 py-4 mb-6">
                <Text className="text-red-500 dark:text-red-400 text-center text-sm font-medium">
                  {error}
                </Text>
              </View>
            ) : null}

            <TouchableOpacity
              className={`h-14 bg-[#007AFF] rounded-2xl items-center justify-center ${loading ? "opacity-70" : ""}`}
              onPress={step === "login" ? handleLogin : goNext}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text className="text-white text-base font-semibold tracking-wide">
                  {step === "login"
                    ? "Log In"
                    : step === 5
                      ? "Create Account"
                      : "Continue"}
                </Text>
              )}
            </TouchableOpacity>

            <View className="flex-row justify-center items-center mt-10 gap-2">
              <Text
                style={{ color: isDark ? "#aaa" : "#666" }}
                className="text-base"
              >
                {step === "login"
                  ? "Don't have an account?"
                  : "Already have an account?"}
              </Text>
              <TouchableOpacity
                onPress={step === "login" ? switchToSignUp : switchToLogin}
              >
                <Text className="text-[#007AFF] font-semibold text-base">
                  {step === "login" ? "Sign Up" : "Log In"}
                </Text>
              </TouchableOpacity>
            </View>

            {step !== "login" && step > 1 && (
              <TouchableOpacity
                onPress={goBack}
                style={{ alignSelf: "center", marginTop: 24 }}
                hitSlop={{ top: 12, bottom: 12, left: 20, right: 20 }}
              >
                <Text className="text-[#007AFF] text-base font-medium">
                  ← Back
                </Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
