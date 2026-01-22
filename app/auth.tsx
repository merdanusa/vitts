import { router } from "expo-router";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Fingerprint,
  Lock,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react-native";
import { AnimatePresence, MotiView } from "moti";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// --- Types & Constants ---
type Step = { id: number; label: string; icon: any; field: string };
const STEPS: Step[] = [
  { id: 1, label: "Email", icon: Mail, field: "email" },
  { id: 2, label: "Handle", icon: Fingerprint, field: "username" },
  { id: 3, label: "Identity", icon: User, field: "name" },
  { id: 4, label: "Secure", icon: Lock, field: "password" },
  { id: 5, label: "Verify", icon: ShieldCheck, field: "confirmPassword" },
];

export default function AuthScreen() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    email: "",
    username: "",
    name: "",
    password: "",
    confirmPassword: "",
  });

  // --- Validation Logic ---
  const validate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (mode === "signup") {
      if (step === 1 && !emailRegex.test(form.email))
        return "Enter a valid email address";
      if (step === 2 && form.username.length < 3)
        return "Username must be at least 3 characters";
      if (step === 3 && !form.name.trim()) return "Please enter your full name";
      if (step === 4 && form.password.length < 8)
        return "Password must be at least 8 characters";
      if (step === 5 && form.password !== form.confirmPassword)
        return "Passwords do not match";
    } else {
      if (!form.email || !form.password) return "Please fill in all fields";
    }
    return null;
  };

  const handleNext = () => {
    const err = validate();
    if (err) return setError(err);
    setError("");

    if (mode === "signup" && step < 5) {
      setStep((s) => s + 1);
    } else {
      submit();
    }
  };

  const submit = async () => {
    setLoading(true);
    // Simulate API Call
    setTimeout(() => {
      setLoading(false);
      router.replace("/(tabs)");
    }, 1500);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-zinc-950">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          className="px-6 py-8"
        >
          {/* Header Section */}
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="items-center mb-10"
          >
            <View className="w-20 h-20 bg-blue-600 rounded-3xl items-center justify-center shadow-xl shadow-blue-500/40">
              <ShieldCheck color="white" size={40} strokeWidth={2.5} />
            </View>
            <Text className="text-3xl font-bold mt-6 tracking-tight dark:text-white">
              {mode === "login" ? "Welcome back" : "Create account"}
            </Text>
          </MotiView>

          <View className="flex-row">
            {/* Sidebar Status Indicator (Signup Only) */}
            {mode === "signup" && (
              <View className="w-12 mr-4 items-center py-4">
                {STEPS.map((s, i) => (
                  <View key={s.id} className="items-center">
                    <View
                      className={`w-8 h-8 rounded-full items-center justify-center ${step >= s.id ? "bg-blue-600" : "bg-slate-200 dark:bg-zinc-800"}`}
                    >
                      {step > s.id ? (
                        <CheckCircle2 size={16} color="white" />
                      ) : (
                        <s.icon
                          size={14}
                          color={step === s.id ? "white" : "#94a3b8"}
                        />
                      )}
                    </View>
                    {i < STEPS.length - 1 && (
                      <View
                        className={`w-[2px] h-8 ${step > s.id ? "bg-blue-600" : "bg-slate-200 dark:bg-zinc-800"}`}
                      />
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Form Container */}
            <View className="flex-1">
              <AnimatePresence exitBeforeEnter>
                <MotiView
                  key={`${mode}-${step}`}
                  from={{ opacity: 0, translateX: 10 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  exit={{ opacity: 0, translateX: -10 }}
                  transition={{ type: "timing", duration: 250 }}
                >
                  <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    {mode === "login"
                      ? "Authentication"
                      : STEPS[step - 1].label}
                  </Text>

                  <View className="space-y-4">
                    {mode === "login" ? (
                      <>
                        <InputField
                          icon={Mail}
                          placeholder="Email"
                          value={form.email}
                          onChangeText={(t: any) =>
                            setForm({ ...form, email: t })
                          }
                        />
                        <InputField
                          icon={Lock}
                          placeholder="Password"
                          value={form.password}
                          onChangeText={(t: any) =>
                            setForm({ ...form, password: t })
                          }
                          secure
                        />
                      </>
                    ) : (
                      <InputField
                        icon={STEPS[step - 1].icon}
                        placeholder={STEPS[step - 1].label}
                        value={(form as any)[STEPS[step - 1].field]}
                        onChangeText={(t: any) =>
                          setForm({ ...form, [STEPS[step - 1].field]: t })
                        }
                        secure={step >= 4}
                      />
                    )}
                  </View>
                </MotiView>
              </AnimatePresence>

              {error ? (
                <MotiView
                  from={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/50"
                >
                  <Text className="text-red-600 dark:text-red-400 text-sm font-medium text-center">
                    {error}
                  </Text>
                </MotiView>
              ) : null}

              {/* Actions */}
              <TouchableOpacity
                onPress={handleNext}
                disabled={loading}
                activeOpacity={0.8}
                className="bg-blue-600 h-16 rounded-2xl mt-8 flex-row items-center justify-center shadow-lg shadow-blue-600/30"
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Text className="text-white font-bold text-lg mr-2">
                      {mode === "login"
                        ? "Sign In"
                        : step === 5
                          ? "Complete"
                          : "Continue"}
                    </Text>
                    <ChevronRight color="white" size={20} />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer Switcher */}
          <View className="mt-auto pt-10 items-center">
            <TouchableOpacity
              onPress={() => {
                setMode(mode === "login" ? "signup" : "login");
                setStep(1);
                setError("");
              }}
              className="flex-row items-center"
            >
              <Text className="text-slate-500 dark:text-zinc-400 text-base">
                {mode === "login"
                  ? "New to the platform?"
                  : "Joined us before?"}
              </Text>
              <Text className="text-blue-600 font-bold text-base ml-2">
                {mode === "login" ? "Create Account" : "Log In"}
              </Text>
            </TouchableOpacity>

            {mode === "signup" && step > 1 && (
              <TouchableOpacity
                onPress={() => setStep((s) => s - 1)}
                className="mt-6 flex-row items-center"
              >
                <ArrowLeft size={16} color="#3b82f6" />
                <Text className="text-blue-500 font-semibold ml-2">
                  Back to previous step
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// --- Specialized Internal Components ---
function InputField({
  icon: Icon,
  placeholder,
  value,
  onChangeText,
  secure,
}: any) {
  return (
    <View className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 h-16 rounded-2xl flex-row items-center px-4">
      <View className="w-10">
        <Icon size={20} color="#64748b" />
      </View>
      <View className="flex-1">
        <Text className="text-[10px] text-slate-400 font-bold uppercase mb-[-4px]">
          {placeholder}
        </Text>
        <input
          // Note: In React Native this would be <TextInput />
          // but I'm showing the logic structure
          style={{
            color: "#000",
            fontSize: 16,
            fontWeight: "600",
            width: "100%",
            backgroundColor: "transparent",
            border: "none",
            outline: "none",
          }}
          value={value}
          onChange={(e: any) => onChangeText(e.target.value)}
          placeholder={`Enter ${placeholder.toLowerCase()}...`}
          type={secure ? "password" : "text"}
        />
      </View>
    </View>
  );
}
