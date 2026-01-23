import { Image } from "@/components/ui/image";
import { forgotPassword, login, register, resetPassword } from "@/services/api";
import { useRouter } from "expo-router";
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

const { width } = Dimensions.get("window");

type Step = { id: number; label: string; icon: any; field: string };
const STEPS: Step[] = [
  { id: 1, label: "Email", icon: Mail, field: "email" },
  { id: 2, label: "Username", icon: Hash, field: "username" },
  { id: 3, label: "Full Name", icon: User, field: "name" },
  { id: 4, label: "Password", icon: Lock, field: "password" },
];

type AuthMode = "login" | "signup" | "verify" | "forgot" | "reset";

export default function AuthScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
        await login({
          login: form.email,
          password: form.password,
        });
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
    setError("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.replace("/(tabs)");
    } catch (err: any) {
      setError("Invalid verification code");
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

  if (mode === "verify") {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-black">
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
              <Text className="text-2xl font-bold text-center mb-2 dark:text-white">
                Enter Confirmation Code
              </Text>
              <Text className="text-gray-500 dark:text-zinc-400 text-sm text-center mb-8 px-4">
                We have sent a 6-digit code to {form.email}
              </Text>

              <View className="flex-row justify-center mb-6">
                {verificationCode.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => (codeInputs.current[index] = ref)}
                    className="w-12 h-14 mx-1 text-center text-xl font-bold border-2 border-gray-300 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-900 text-black dark:text-white"
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
      <SafeAreaView className="flex-1 bg-white dark:bg-black">
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
              <View className="w-16 h-16 rounded-full bg-gray-100 dark:bg-zinc-900 items-center justify-center mb-6 self-center">
                <Lock size={28} color="#3b82f6" />
              </View>

              <Text className="text-2xl font-bold text-center mb-2 dark:text-white">
                Trouble Logging In?
              </Text>
              <Text className="text-gray-500 dark:text-zinc-400 text-sm text-center mb-8 px-4">
                Enter your email and we'll send you a code to reset your
                password.
              </Text>

              <InputField
                placeholder="Email"
                value={forgotEmail}
                onChangeText={setForgotEmail}
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
      <SafeAreaView className="flex-1 bg-white dark:bg-black">
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
              <Text className="text-2xl font-bold text-center mb-2 dark:text-white">
                Reset Password
              </Text>
              <Text className="text-gray-500 dark:text-zinc-400 text-sm text-center mb-8 px-4">
                Enter the code sent to {forgotEmail}
              </Text>

              <View className="flex-row justify-center mb-6">
                {resetCode.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => (resetInputs.current[index] = ref)}
                    className="w-12 h-14 mx-1 text-center text-xl font-bold border-2 border-gray-300 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-900 text-black dark:text-white"
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
    <SafeAreaView className="flex-1 py-10 bg-white dark:bg-black">
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
                    className={`h-[3px] flex-1 mx-1 rounded-full ${
                      step >= s.id
                        ? "bg-blue-500"
                        : "bg-gray-200 dark:bg-zinc-800"
                    }`}
                  />
                ))}
              </View>
            </View>
          )}

          <View className="flex-1">
            {mode === "login" ? (
              <>
                <InputField
                  placeholder="Phone number, email or username"
                  value={form.email}
                  onChangeText={(t: string) => setForm({ ...form, email: t })}
                />
                <InputField
                  placeholder="Password"
                  value={form.password}
                  onChangeText={(t: string) =>
                    setForm({ ...form, password: t })
                  }
                  secure
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
                  <Text className="text-blue-900 dark:text-blue-400 text-xs text-center font-semibold">
                    Forgot password?
                  </Text>
                </TouchableOpacity>

                <View className="flex-row items-center my-8">
                  <View className="flex-1 h-[1px] bg-gray-300 dark:bg-zinc-800" />
                  <Text className="mx-4 text-gray-500 dark:text-zinc-500 text-xs font-semibold">
                    OR
                  </Text>
                  <View className="flex-1 h-[1px] bg-gray-300 dark:bg-zinc-800" />
                </View>

                <TouchableOpacity className="flex-row items-center justify-center py-3">
                  <Facebook size={18} color="#3b5998" fill="#3b5998" />
                  <Text className="ml-2 text-blue-900 dark:text-blue-400 font-bold text-sm">
                    Log in with Facebook
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View className="mb-6">
                  <Text className="text-gray-500 dark:text-zinc-400 text-xs text-center font-semibold px-8">
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
                  <View className="flex-1 h-[1px] bg-gray-300 dark:bg-zinc-800" />
                  <Text className="mx-4 text-gray-500 dark:text-zinc-500 text-xs font-semibold">
                    OR
                  </Text>
                  <View className="flex-1 h-[1px] bg-gray-300 dark:bg-zinc-800" />
                </View>

                <InputField
                  placeholder={STEPS[step - 1].label}
                  value={(form as any)[STEPS[step - 1].field]}
                  onChangeText={(t: string) =>
                    setForm({ ...form, [STEPS[step - 1].field]: t })
                  }
                  secure={step >= 4}
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

                <Text className="text-gray-500 dark:text-zinc-500 text-xs text-center mt-6 px-4">
                  People who use our service may have uploaded your contact
                  information to Instagram.{" "}
                  <Text className="text-blue-900 dark:text-blue-400 font-semibold">
                    Learn More
                  </Text>
                </Text>

                <Text className="text-gray-500 dark:text-zinc-500 text-xs text-center mt-6 px-4">
                  By signing up, you agree to our{" "}
                  <Text className="text-blue-900 dark:text-blue-400 font-semibold">
                    Terms
                  </Text>
                  ,{" "}
                  <Text className="text-blue-900 dark:text-blue-400 font-semibold">
                    Privacy Policy
                  </Text>{" "}
                  and{" "}
                  <Text className="text-blue-900 dark:text-blue-400 font-semibold">
                    Cookies Policy
                  </Text>
                  .
                </Text>
              </>
            )}
          </View>

          <View className="mt-auto pt-8 pb-4">
            <View className="border-t border-gray-200 dark:border-zinc-800 pt-6">
              <TouchableOpacity
                onPress={() => {
                  setMode(mode === "login" ? "signup" : "login");
                  setStep(1);
                  setError("");
                }}
                className="flex-row items-center justify-center"
              >
                <Text className="text-gray-500 dark:text-zinc-400 text-xs">
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
}: {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secure?: boolean;
}) {
  return (
    <View className="h-11 px-4 mb-3 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800">
      <TextInput
        className="flex-1 text-sm text-black dark:text-white"
        style={{ paddingVertical: 0 }}
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
