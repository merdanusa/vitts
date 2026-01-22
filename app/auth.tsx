import { login, register } from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const MAX_FORM_WIDTH = 420;

type AuthMode = "login" | "signup";
type SignUpStep = 1 | 2 | 3 | 4 | 5;

export default function AuthScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [signUpStep, setSignUpStep] = useState<SignUpStep>(1);
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
  }, [authMode, signUpStep]);

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

  const handleNextStep = () => {
    setError("");
    switch (signUpStep) {
      case 1:
        if (!email.trim()) return setError("Email is required");
        if (!email.includes("@")) return setError("Invalid email");
        setSignUpStep(2);
        break;
      case 2:
        if (!username.trim()) return setError("Username is required");
        if (username.length < 3) return setError("Min 3 characters");
        setSignUpStep(3);
        break;
      case 3:
        if (!name.trim()) return setError("Name is required");
        setSignUpStep(4);
        break;
      case 4:
        if (!password.trim()) return setError("Password is required");
        if (password.length < 6) return setError("Min 6 characters");
        setSignUpStep(5);
        break;
      case 5:
        handleSignUpComplete();
        break;
    }
  };

  const handleBackStep = () => {
    setError("");
    if (signUpStep > 1) {
      setSignUpStep((prev) => (prev - 1) as SignUpStep);
    }
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
    setAuthMode("signup");
    setSignUpStep(1);
  };

  const switchToLogin = () => {
    resetForm();
    setAuthMode("login");
  };

  const renderFormFields = () => {
    if (authMode === "login") {
      return (
        <>
          <TextInput
            style={{
              backgroundColor: isDark ? "#111" : "#f8f9fa",
              color: isDark ? "#fff" : "#000",
              borderWidth: 1,
              borderColor: isDark ? "#333" : "#ddd",
              height: 56,
              borderRadius: 16,
              paddingHorizontal: 20,
              marginBottom: 16,
              fontSize: 16,
            }}
            value={username || email}
            onChangeText={(t) => {
              if (t.includes("@")) setEmail(t);
              else setUsername(t);
            }}
            placeholder="Username or Email"
            placeholderTextColor={isDark ? "#666" : "#999"}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType={email.includes("@") ? "email-address" : "default"}
          />

          <View style={{ position: "relative", marginBottom: 24 }}>
            <TextInput
              style={{
                backgroundColor: isDark ? "#111" : "#f8f9fa",
                color: isDark ? "#fff" : "#000",
                borderWidth: 1,
                borderColor: isDark ? "#333" : "#ddd",
                height: 56,
                borderRadius: 16,
                paddingHorizontal: 20,
                paddingRight: 80,
                fontSize: 16,
              }}
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={isDark ? "#666" : "#999"}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={{ position: "absolute", right: 20, top: 16 }}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text
                style={{ color: "#007AFF", fontWeight: "500", fontSize: 16 }}
              >
                {showPassword ? "Hide" : "Show"}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      );
    }

    switch (signUpStep) {
      case 1:
        return (
          <TextInput
            style={{
              backgroundColor: isDark ? "#111" : "#f8f9fa",
              color: isDark ? "#fff" : "#000",
              borderWidth: 1,
              borderColor: isDark ? "#333" : "#ddd",
              height: 56,
              borderRadius: 16,
              paddingHorizontal: 20,
              marginBottom: 24,
              fontSize: 16,
            }}
            value={email}
            onChangeText={setEmail}
            placeholder="Email address"
            placeholderTextColor={isDark ? "#666" : "#999"}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        );
      case 2:
        return (
          <TextInput
            style={{
              backgroundColor: isDark ? "#111" : "#f8f9fa",
              color: isDark ? "#fff" : "#000",
              borderWidth: 1,
              borderColor: isDark ? "#333" : "#ddd",
              height: 56,
              borderRadius: 16,
              paddingHorizontal: 20,
              marginBottom: 24,
              fontSize: 16,
            }}
            value={username}
            onChangeText={setUsername}
            placeholder="Username"
            placeholderTextColor={isDark ? "#666" : "#999"}
            autoCapitalize="none"
          />
        );
      case 3:
        return (
          <TextInput
            style={{
              backgroundColor: isDark ? "#111" : "#f8f9fa",
              color: isDark ? "#fff" : "#000",
              borderWidth: 1,
              borderColor: isDark ? "#333" : "#ddd",
              height: 56,
              borderRadius: 16,
              paddingHorizontal: 20,
              marginBottom: 24,
              fontSize: 16,
            }}
            value={name}
            onChangeText={setName}
            placeholder="Full name"
            placeholderTextColor={isDark ? "#666" : "#999"}
            autoCapitalize="words"
          />
        );
      case 4:
        return (
          <View style={{ position: "relative", marginBottom: 24 }}>
            <TextInput
              style={{
                backgroundColor: isDark ? "#111" : "#f8f9fa",
                color: isDark ? "#fff" : "#000",
                borderWidth: 1,
                borderColor: isDark ? "#333" : "#ddd",
                height: 56,
                borderRadius: 16,
                paddingHorizontal: 20,
                paddingRight: 80,
                fontSize: 16,
              }}
              value={password}
              onChangeText={setPassword}
              placeholder="Password (min 6)"
              placeholderTextColor={isDark ? "#666" : "#999"}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={{ position: "absolute", right: 20, top: 16 }}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text
                style={{ color: "#007AFF", fontWeight: "500", fontSize: 16 }}
              >
                {showPassword ? "Hide" : "Show"}
              </Text>
            </TouchableOpacity>
          </View>
        );
      case 5:
        return (
          <View style={{ position: "relative", marginBottom: 24 }}>
            <TextInput
              style={{
                backgroundColor: isDark ? "#111" : "#f8f9fa",
                color: isDark ? "#fff" : "#000",
                borderWidth: 1,
                borderColor: isDark ? "#333" : "#ddd",
                height: 56,
                borderRadius: 16,
                paddingHorizontal: 20,
                paddingRight: 80,
                fontSize: 16,
              }}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm password"
              placeholderTextColor={isDark ? "#666" : "#999"}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={{ position: "absolute", right: 20, top: 16 }}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Text
                style={{ color: "#007AFF", fontWeight: "500", fontSize: 16 }}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
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
              style={{
                width: 88,
                height: 88,
                borderRadius: 24,
                marginBottom: 24,
              }}
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
            {authMode === "signup" && (
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
                        s === signUpStep
                          ? "#007AFF"
                          : s < signUpStep
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
                  fontSize: authMode === "login" ? 32 : 26,
                  fontWeight: "700",
                  letterSpacing: -0.5,
                  textAlign: "center",
                }}
              >
                {authMode === "login"
                  ? "Welcome back"
                  : signUpStep === 1
                    ? "Your email"
                    : signUpStep === 2
                      ? "Choose username"
                      : signUpStep === 3
                        ? "Your name"
                        : signUpStep === 4
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
                {authMode === "login"
                  ? "Sign in to continue"
                  : signUpStep !== 5
                    ? `Step ${signUpStep} of 5`
                    : "Make sure they match"}
              </Text>
            </View>

            {renderFormFields()}

            {error ? (
              <View
                style={{
                  backgroundColor: isDark ? "#ff555515" : "#ff555510",
                  borderRadius: 16,
                  paddingHorizontal: 20,
                  paddingVertical: 16,
                  marginBottom: 24,
                }}
              >
                <Text
                  style={{
                    color: isDark ? "#ff6b6b" : "#dc2626",
                    textAlign: "center",
                    fontSize: 14,
                    fontWeight: "500",
                  }}
                >
                  {error}
                </Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={{
                height: 56,
                backgroundColor: "#007AFF",
                borderRadius: 16,
                alignItems: "center",
                justifyContent: "center",
                opacity: loading ? 0.7 : 1,
              }}
              onPress={authMode === "login" ? handleLogin : handleNextStep}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 16,
                    fontWeight: "600",
                    letterSpacing: 0.5,
                  }}
                >
                  {authMode === "login"
                    ? "Log In"
                    : signUpStep === 5
                      ? "Create Account"
                      : "Continue"}
                </Text>
              )}
            </TouchableOpacity>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                marginTop: 40,
                gap: 8,
              }}
            >
              <Text
                style={{
                  color: isDark ? "#aaa" : "#666",
                  fontSize: 16,
                }}
              >
                {authMode === "login"
                  ? "Don't have an account?"
                  : "Already have an account?"}
              </Text>
              <TouchableOpacity
                onPress={authMode === "login" ? switchToSignUp : switchToLogin}
              >
                <Text
                  style={{
                    color: "#007AFF",
                    fontWeight: "600",
                    fontSize: 16,
                  }}
                >
                  {authMode === "login" ? "Sign Up" : "Log In"}
                </Text>
              </TouchableOpacity>
            </View>

            {authMode === "signup" && signUpStep > 1 && (
              <TouchableOpacity
                onPress={handleBackStep}
                style={{ alignSelf: "center", marginTop: 24 }}
                hitSlop={{ top: 12, bottom: 12, left: 20, right: 20 }}
              >
                <Text
                  style={{
                    color: "#007AFF",
                    fontSize: 16,
                    fontWeight: "500",
                  }}
                >
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
