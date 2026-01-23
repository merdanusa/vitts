import { Image } from "@/components/ui/image";
import {
  forgotPassword,
  login,
  register,
  resetPassword,
  verifyEmail,
} from "@/services/api";
import { RootState } from "@/store";
import { setUser } from "@/store/userSlice";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { Facebook, Hash, Lock, Mail, User } from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import AvatarUploadScreen from "../(settings)/avatar_upload";

const { width } = Dimensions.get("window");

type Step = { id: number; label: string; icon: any; field: string };
const STEPS: Step[] = [
  { id: 1, label: "Email", icon: Mail, field: "email" },
  { id: 2, label: "Username", icon: Hash, field: "username" },
  { id: 3, label: "Full Name", icon: User, field: "name" },
  { id: 4, label: "Password", icon: Lock, field: "password" },
];

type AuthMode = "login" | "signup" | "verify" | "forgot" | "reset" | "avatar";

export default function AuthScreen() {
  const router = useRouter();
  const isDark = useSelector((state: RootState) => state.theme.isDark);
  const [mode, setMode] = useState<AuthMode>("login");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const dispatch = useDispatch();

  const [form, setForm] = useState({
    email: "",
    username: "",
    name: "",
    password: "",
  });

  const [verificationCode, setVerificationCode] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [resetCode, setResetCode] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");

  const [verifiedUser, setVerifiedUser] = useState<any>(null);

  const codeInputs = useRef<(TextInput | null)[]>([]);
  const resetInputs = useRef<(TextInput | null)[]>([]);

  const validate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (mode === "signup") {
      if (step === 1 && !emailRegex.test(form.email))
        return "Enter a valid email";
      if (step === 2 && form.username.length < 3)
        return "Username is too short";
      if (step === 3 && !form.name.trim()) return "Enter your name";
      if (step === 4 && form.password.length < 6)
        return "Password must be at least 6 characters";
    } else if (mode === "login") {
      if (!form.email || !form.password) return "Please fill all fields";
    } else if (mode === "forgot") {
      if (!emailRegex.test(forgotEmail)) return "Enter a valid email";
    } else if (mode === "reset") {
      if (resetCode.some((c) => !c)) return "Enter the complete code";
      if (newPassword.length < 6)
        return "Password must be at least 6 characters";
    }
    return null;
  };

  const handleNext = () => {
    const err = validate();
    if (err) return setError(err);
    setError("");

    if (mode === "signup" && step < 4) {
      setStep((s) => s + 1);
    } else {
      submit();
    }
  };

  const submit = async () => {
    setLoading(true);
    setError("");

    try {
      if (mode === "signup") {
        await register({
          name: form.name,
          login: form.username,
          email: form.email,
          password: form.password,
        });
        setMode("verify");
      } else if (mode === "login") {
        const response = await login({
          login: form.email,
          password: form.password,
        });

        await SecureStore.setItemAsync("userToken", response.token);
        dispatch(setUser(response.user));

        router.replace("/(tabs)");
      } else if (mode === "forgot") {
        await forgotPassword({ email: forgotEmail });
        setMode("reset");
      } else if (mode === "reset") {
        const code = resetCode.join("");
        await resetPassword({ code, newPassword });
        Alert.alert("Success", "Password reset successfully!");
        setMode("login");
        setResetCode(["", "", "", "", "", ""]);
        setNewPassword("");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (verificationCode.some((c) => !c)) {
      setError("Enter the complete code");
      return;
    }
    setLoading(true);
    try {
      const code = verificationCode.join("");
      const response = await verifyEmail({ code });

      await SecureStore.setItemAsync("userToken", response.token);

      setVerifiedUser(response.user);
      setMode("avatar");
    } catch (err: any) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (value: string, index: number, isReset = false) => {
    const code = isReset ? [...resetCode] : [...verificationCode];
    const inputs = isReset ? resetInputs : codeInputs;

    if (value.length > 1) {
      value = value[value.length - 1];
    }

    code[index] = value.toUpperCase();

    if (isReset) {
      setResetCode(code);
    } else {
      setVerificationCode(code);
    }

    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyPress = (e: any, index: number, isReset = false) => {
    const inputs = isReset ? resetInputs : codeInputs;

    if (e.nativeEvent.key === "Backspace" && index > 0) {
      const code = isReset ? [...resetCode] : [...verificationCode];
      if (!code[index]) {
        inputs.current[index - 1]?.focus();
      }
    }
  };

  const handleAvatarComplete = () => {
    dispatch(setUser(verifiedUser));
    router.replace("/(tabs)");
  };

  if (mode === "avatar") {
    return (
      <AvatarUploadScreen
        onComplete={handleAvatarComplete}
        userName={verifiedUser?.name || ""}
      />
    );
  }

  if (mode === "verify") {
    return (
      <SafeAreaView
        style={{ backgroundColor: isDark ? "#000000" : "#ffffff" }}
        className="flex-1"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24 }}
            showsVerticalScrollIndicator={false}
          >
            <View className="items-center pt-16 pb-8">
              <Image
                source={require("@/assets/images/app_icon.png")}
                className="w-16 h-16"
                alt="logo"
              />
            </View>

            <View className="flex-1 justify-center pb-20">
              <Text
                style={{ color: isDark ? "#ffffff" : "#000000" }}
                className="text-2xl font-bold text-center mb-2"
              >
                Enter Confirmation Code
              </Text>
              <Text
                style={{ color: isDark ? "#a1a1aa" : "#6b7280" }}
                className="text-sm text-center mb-8 px-4"
              >
                We have sent a 6-digit code to {form.email}
              </Text>

              <View className="flex-row justify-center mb-6">
                {verificationCode.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => (codeInputs.current[index] = ref)}
                    style={{
                      borderColor: isDark ? "#3f3f46" : "#d1d5db",
                      backgroundColor: isDark ? "#18181b" : "#f9fafb",
                      color: isDark ? "#ffffff" : "#000000",
                    }}
                    className="w-12 h-14 mx-1 text-center text-xl font-bold border-2 rounded-lg"
                    maxLength={1}
                    value={digit}
                    onChangeText={(value) => handleCodeChange(value, index)}
                    onKeyPress={(e) => handleCodeKeyPress(e, index)}
                    keyboardType="default"
                    autoCapitalize="characters"
                    autoCorrect={false}
                  />
                ))}
              </View>

              {error ? (
                <Text className="text-red-500 text-xs text-center mb-4">
                  {error}
                </Text>
              ) : null}

              <TouchableOpacity
                onPress={handleVerify}
                disabled={loading}
                activeOpacity={0.7}
                className="bg-blue-500 h-12 rounded-lg items-center justify-center mb-4"
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text className="text-white font-bold text-sm">Confirm</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity className="py-3">
                <Text className="text-blue-500 text-sm text-center font-semibold">
                  Resend Code
                </Text>
              </TouchableOpacity>
            </View>

            <View className="pb-4">
              <TouchableOpacity
                onPress={() => {
                  setMode("login");
                  setVerificationCode(["", "", "", "", "", ""]);
                  setError("");
                }}
                className="py-3"
              >
                <Text className="text-blue-500 text-sm text-center font-semibold">
                  Back to Login
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  if (mode === "forgot") {
    return (
      <SafeAreaView
        style={{ backgroundColor: isDark ? "#000000" : "#ffffff" }}
        className="flex-1"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24 }}
            showsVerticalScrollIndicator={false}
          >
            <View className="items-center pt-16 pb-8">
              <Image
                source={require("@/assets/images/app_icon.png")}
                className="w-16 h-16"
              />
            </View>

            <View className="flex-1 justify-center pb-20">
              <View
                style={{
                  backgroundColor: isDark ? "#18181b" : "#f3f4f6",
                }}
                className="w-16 h-16 rounded-full items-center justify-center mb-6 self-center"
              >
                <Lock size={28} color="#3b82f6" />
              </View>

              <Text
                style={{ color: isDark ? "#ffffff" : "#000000" }}
                className="text-2xl font-bold text-center mb-2"
              >
                Trouble Logging In?
              </Text>
              <Text
                style={{ color: isDark ? "#a1a1aa" : "#6b7280" }}
                className="text-sm text-center mb-8 px-4"
              >
                Enter your email and we will send you a code to reset your
                password.
              </Text>

              <InputField
                placeholder="Email"
                value={forgotEmail}
                onChangeText={setForgotEmail}
                isDark={isDark}
              />

              {error ? (
                <Text className="text-red-500 text-xs text-center mt-3">
                  {error}
                </Text>
              ) : null}

              <TouchableOpacity
                onPress={handleNext}
                disabled={loading}
                activeOpacity={0.7}
                className="bg-blue-500 h-12 rounded-lg mt-4 items-center justify-center"
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text className="text-white font-bold text-sm">
                    Send Code
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            <View className="pb-4">
              <TouchableOpacity
                onPress={() => {
                  setMode("login");
                  setForgotEmail("");
                  setError("");
                }}
                className="py-3"
              >
                <Text className="text-blue-500 text-sm text-center font-semibold">
                  Back to Login
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  if (mode === "reset") {
    return (
      <SafeAreaView
        style={{ backgroundColor: isDark ? "#000000" : "#ffffff" }}
        className="flex-1"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24 }}
            showsVerticalScrollIndicator={false}
          >
            <View className="items-center pt-16 pb-8">
              <Image
                source={require("@/assets/images/app_icon.png")}
                className="w-16 h-16"
              />
            </View>

            <View className="flex-1 justify-center pb-20">
              <Text
                style={{ color: isDark ? "#ffffff" : "#000000" }}
                className="text-2xl font-bold text-center mb-2"
              >
                Reset Password
              </Text>
              <Text
                style={{ color: isDark ? "#a1a1aa" : "#6b7280" }}
                className="text-sm text-center mb-8 px-4"
              >
                Enter the code sent to {forgotEmail}
              </Text>

              <View className="flex-row justify-center mb-6">
                {resetCode.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => (resetInputs.current[index] = ref)}
                    style={{
                      borderColor: isDark ? "#3f3f46" : "#d1d5db",
                      backgroundColor: isDark ? "#18181b" : "#f9fafb",
                      color: isDark ? "#ffffff" : "#000000",
                    }}
                    className="w-12 h-14 mx-1 text-center text-xl font-bold border-2 rounded-lg"
                    maxLength={1}
                    value={digit}
                    onChangeText={(value) =>
                      handleCodeChange(value, index, true)
                    }
                    onKeyPress={(e) => handleCodeKeyPress(e, index, true)}
                    keyboardType="default"
                    autoCapitalize="characters"
                    autoCorrect={false}
                  />
                ))}
              </View>

              <InputField
                placeholder="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                secure
                isDark={isDark}
              />

              {error ? (
                <Text className="text-red-500 text-xs text-center mt-3">
                  {error}
                </Text>
              ) : null}

              <TouchableOpacity
                onPress={handleNext}
                disabled={loading}
                activeOpacity={0.7}
                className="bg-blue-500 h-12 rounded-lg mt-4 items-center justify-center"
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text className="text-white font-bold text-sm">
                    Reset Password
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity className="py-3 mt-2">
                <Text className="text-blue-500 text-sm text-center font-semibold">
                  Resend Code
                </Text>
              </TouchableOpacity>
            </View>

            <View className="pb-4">
              <TouchableOpacity
                onPress={() => {
                  setMode("login");
                  setResetCode(["", "", "", "", "", ""]);
                  setNewPassword("");
                  setError("");
                }}
                className="py-3"
              >
                <Text className="text-blue-500 text-sm text-center font-semibold">
                  Back to Login
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ backgroundColor: isDark ? "#000000" : "#ffffff" }}
      className="flex-1 py-10"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center pt-16 pb-8">
            <Image
              source={require("@/assets/images/app_icon.png")}
              className="w-16 h-16"
            />
          </View>

          {mode === "signup" && (
            <View className="mb-6">
              <View className="flex-row justify-center mb-2">
                {STEPS.map((s, i) => (
                  <View
                    key={s.id}
                    style={{
                      backgroundColor:
                        step >= s.id
                          ? "#3b82f6"
                          : isDark
                            ? "#27272a"
                            : "#e5e7eb",
                    }}
                    className="h-[3px] flex-1 mx-1 rounded-full"
                  />
                ))}
              </View>
            </View>
          )}

          <View className="flex-1">
            {mode === "login" ? (
              <>
                <InputField
                  placeholder="Email or username"
                  value={form.email}
                  onChangeText={(t: string) => setForm({ ...form, email: t })}
                  isDark={isDark}
                />
                <InputField
                  placeholder="Password"
                  value={form.password}
                  onChangeText={(t: string) =>
                    setForm({ ...form, password: t })
                  }
                  secure
                  isDark={isDark}
                />

                {error ? (
                  <Text className="text-red-500 text-xs text-center mt-3">
                    {error}
                  </Text>
                ) : null}

                <TouchableOpacity
                  onPress={handleNext}
                  disabled={loading}
                  activeOpacity={0.7}
                  className="bg-blue-500 h-12 rounded-lg mt-4 items-center justify-center"
                >
                  {loading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text className="text-white font-bold text-sm">Log In</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  className="mt-4"
                  onPress={() => {
                    setMode("forgot");
                    setError("");
                  }}
                >
                  <Text
                    style={{ color: isDark ? "#60a5fa" : "#1e3a8a" }}
                    className="text-xs text-center font-semibold"
                  >
                    Forgot password?
                  </Text>
                </TouchableOpacity>

                <View className="flex-row items-center my-8">
                  <View
                    style={{
                      backgroundColor: isDark ? "#27272a" : "#d1d5db",
                    }}
                    className="flex-1 h-[1px]"
                  />
                  <Text
                    style={{ color: isDark ? "#71717a" : "#6b7280" }}
                    className="mx-4 text-xs font-semibold"
                  >
                    OR
                  </Text>
                  <View
                    style={{
                      backgroundColor: isDark ? "#27272a" : "#d1d5db",
                    }}
                    className="flex-1 h-[1px]"
                  />
                </View>

                <TouchableOpacity className="flex-row items-center justify-center py-3">
                  <Facebook size={18} color="#3b5998" fill="#3b5998" />
                  <Text
                    style={{ color: isDark ? "#60a5fa" : "#1e3a8a" }}
                    className="ml-2 font-bold text-sm"
                  >
                    Log in with Facebook
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View className="mb-6">
                  <Text
                    style={{ color: isDark ? "#a1a1aa" : "#6b7280" }}
                    className="text-xs text-center font-semibold px-8"
                  >
                    Sign up to see photos and videos from your friends.
                  </Text>
                </View>

                <TouchableOpacity className="bg-blue-500 h-11 rounded-lg items-center justify-center mb-4 flex-row">
                  <Facebook size={18} color="white" fill="white" />
                  <Text className="text-white font-bold text-sm ml-2">
                    Log in with Facebook
                  </Text>
                </TouchableOpacity>

                <View className="flex-row items-center my-6">
                  <View
                    style={{
                      backgroundColor: isDark ? "#27272a" : "#d1d5db",
                    }}
                    className="flex-1 h-[1px]"
                  />
                  <Text
                    style={{ color: isDark ? "#71717a" : "#6b7280" }}
                    className="mx-4 text-xs font-semibold"
                  >
                    OR
                  </Text>
                  <View
                    style={{
                      backgroundColor: isDark ? "#27272a" : "#d1d5db",
                    }}
                    className="flex-1 h-[1px]"
                  />
                </View>

                <InputField
                  placeholder={STEPS[step - 1].label}
                  value={(form as any)[STEPS[step - 1].field]}
                  onChangeText={(t: string) =>
                    setForm({ ...form, [STEPS[step - 1].field]: t })
                  }
                  secure={step >= 4}
                  isDark={isDark}
                />

                {error ? (
                  <Text className="text-red-500 text-xs text-center mt-3">
                    {error}
                  </Text>
                ) : null}

                <TouchableOpacity
                  onPress={handleNext}
                  disabled={loading}
                  activeOpacity={0.7}
                  className="bg-blue-500 h-11 rounded-lg mt-4 items-center justify-center"
                >
                  {loading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text className="text-white font-bold text-sm">
                      {step === 4 ? "Sign Up" : "Next"}
                    </Text>
                  )}
                </TouchableOpacity>

                {step > 1 && (
                  <TouchableOpacity
                    onPress={() => setStep((s) => s - 1)}
                    className="mt-4"
                  >
                    <Text className="text-blue-500 text-sm text-center font-semibold">
                      Back
                    </Text>
                  </TouchableOpacity>
                )}

                <Text
                  style={{ color: isDark ? "#71717a" : "#6b7280" }}
                  className="text-xs text-center mt-6 px-4"
                >
                  People who use our service may have uploaded your contact
                  information to Instagram.{" "}
                  <Text
                    style={{ color: isDark ? "#60a5fa" : "#1e3a8a" }}
                    className="font-semibold"
                  >
                    Learn More
                  </Text>
                </Text>

                <Text
                  style={{ color: isDark ? "#71717a" : "#6b7280" }}
                  className="text-xs text-center mt-6 px-4"
                >
                  By signing up, you agree to our{" "}
                  <Text
                    style={{ color: isDark ? "#60a5fa" : "#1e3a8a" }}
                    className="font-semibold"
                  >
                    Terms
                  </Text>
                  ,{" "}
                  <Text
                    style={{ color: isDark ? "#60a5fa" : "#1e3a8a" }}
                    className="font-semibold"
                  >
                    Privacy Policy
                  </Text>{" "}
                  and{" "}
                  <Text
                    style={{ color: isDark ? "#60a5fa" : "#1e3a8a" }}
                    className="font-semibold"
                  >
                    Cookies Policy
                  </Text>
                  .
                </Text>
              </>
            )}
          </View>

          <View className="mt-auto pt-8 pb-4">
            <View
              style={{
                borderTopColor: isDark ? "#27272a" : "#e5e7eb",
              }}
              className="border-t pt-6"
            >
              <TouchableOpacity
                onPress={() => {
                  setMode(mode === "login" ? "signup" : "login");
                  setStep(1);
                  setError("");
                }}
                className="flex-row items-center justify-center"
              >
                <Text
                  style={{ color: isDark ? "#a1a1aa" : "#6b7280" }}
                  className="text-xs"
                >
                  {mode === "login"
                    ? "Don't have an account?"
                    : "Have an account?"}
                </Text>
                <Text className="text-blue-500 font-bold text-xs ml-1">
                  {mode === "login" ? "Sign up" : "Log in"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function InputField({
  placeholder,
  value,
  onChangeText,
  secure,
  isDark,
}: {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secure?: boolean;
  isDark: boolean;
}) {
  return (
    <View
      style={{
        backgroundColor: isDark ? "#18181b" : "#f9fafb",
        borderColor: isDark ? "#27272a" : "#d1d5db",
      }}
      className="h-11 px-4 mb-3 rounded-lg border"
    >
      <TextInput
        style={{
          color: isDark ? "#ffffff" : "#000000",
          paddingVertical: 0,
        }}
        className="flex-1 text-sm"
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secure}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
}
