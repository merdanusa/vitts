import { AuthInput } from "@/components/AuthInput";
import { login, register } from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useColorScheme as useSystemTheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const MAX_FORM_WIDTH = 420;

type AuthMode = "login" | "signup";
type SignUpStep = 1 | 2 | 3 | 4 | 5;

export default function AuthScreen() {
  const systemTheme = useSystemTheme();

  const isDark = useMemo(() => systemTheme === "dark", [systemTheme]);

  const theme = {
    background: isDark ? "#000000" : "#ffffff",
    text: isDark ? "#ffffff" : "#000000",
    subtext: isDark ? "#888888" : "#666666",
    inputBg: isDark ? "#1a1a1a" : "#f5f5f5",
    errorBg: isDark ? "#ff555515" : "#ff555510",
    errorText: isDark ? "#ff6b6b" : "#dc2626",
    dotActive: "#007AFF",
    dotInactive: isDark ? "#333333" : "#eeeeee",
    dotCompleted: isDark ? "#555555" : "#cccccc",
  };

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
          <AuthInput
            value={username || email}
            onChangeText={(t: any) => {
              t.includes("@") ? setEmail(t) : setUsername(t);
            }}
            placeholder="Username or Email"
            autoCapitalize="none"
            keyboardType={email.includes("@") ? "email-address" : "default"}
          />
          <AuthInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            isPassword
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
          />
        </>
      );
    }

    switch (signUpStep) {
      case 1:
        return (
          <AuthInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email address"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        );
      case 2:
        return (
          <AuthInput
            value={username}
            onChangeText={setUsername}
            placeholder="Username"
            autoCapitalize="none"
          />
        );
      case 3:
        return (
          <AuthInput
            value={name}
            onChangeText={setName}
            placeholder="Full name"
            autoCapitalize="words"
          />
        );
      case 4:
        return (
          <AuthInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password (min 6)"
            isPassword
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
          />
        );
      case 5:
        return (
          <AuthInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm password"
            isPassword
            showPassword={showConfirmPassword}
            onTogglePassword={() =>
              setShowConfirmPassword(!showConfirmPassword)
            }
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={{ backgroundColor: theme.background, flex: 1 }}>
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
          <View style={{ alignItems: "center", marginBottom: 48 }}>
            <Image
              source={require("@/assets/images/app_icon.png")}
              style={{
                width: 88,
                height: 88,
                borderRadius: 22,
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
                          ? theme.dotActive
                          : s < signUpStep
                            ? theme.dotCompleted
                            : theme.dotInactive,
                    }}
                  />
                ))}
              </View>
            )}

            <View style={{ alignItems: "center", marginBottom: 48 }}>
              <Text
                style={{
                  color: theme.text,
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
                  color: theme.subtext,
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
                  backgroundColor: theme.errorBg,
                  borderRadius: 16,
                  paddingHorizontal: 20,
                  paddingVertical: 16,
                  marginBottom: 24,
                }}
              >
                <Text
                  style={{
                    color: theme.errorText,
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
                  color: theme.subtext,
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
