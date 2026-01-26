import { RootState } from "@/store";
import { useRouter } from "expo-router";
import { ArrowLeft, Phone } from "lucide-react-native";
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
import { useSelector } from "react-redux";

interface PhoneNumberInputScreenProps {
  title?: string;
  subtitle?: string;
  onSubmit: (phoneNumber: string) => Promise<void>;
  onSkip?: () => void;
  skipText?: string;
  submitText?: string;
  showSkip?: boolean;
  initialValue?: string;
}

export default function PhoneNumberInputScreen({
  title = "Add Phone Number",
  subtitle = "Add your phone number to sync contacts and let friends find you",
  onSubmit,
  onSkip,
  skipText = "Skip",
  submitText = "Continue",
  showSkip = true,
  initialValue = "",
}: PhoneNumberInputScreenProps) {
  const router = useRouter();
  const isDark = useSelector((state: RootState) => state.theme.isDark);
  const [phoneNumber, setPhoneNumber] = useState(
    initialValue.startsWith("+") ? initialValue.slice(1) : initialValue,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  };

  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/^\+/, "");
    setPhoneNumber(cleaned);
    setError("");
  };

  const handleSubmit = async () => {
    if (!phoneNumber.trim()) {
      setError("Please enter a phone number");
      return;
    }

    const formattedPhone = `+${phoneNumber}`;

    if (!validatePhone(formattedPhone)) {
      setError("Please enter a valid phone number (e.g., +1234567890)");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await onSubmit(formattedPhone);
    } catch (err: any) {
      setError(err.message || "Failed to add phone number");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      router.back();
    }
  };

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
          <View className="flex-row items-center pt-4 pb-8">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-4"
              activeOpacity={0.7}
            >
              <ArrowLeft size={24} color={isDark ? "#ffffff" : "#000000"} />
            </TouchableOpacity>
          </View>

          <View className="flex-1 justify-center pb-20">
            <View
              style={{
                backgroundColor: isDark ? "#18181b" : "#f3f4f6",
              }}
              className="w-20 h-20 rounded-full items-center justify-center mb-8 self-center"
            >
              <Phone size={32} color="#3b82f6" />
            </View>

            <Text
              style={{ color: isDark ? "#ffffff" : "#000000" }}
              className="text-2xl font-bold text-center mb-3"
            >
              {title}
            </Text>

            <Text
              style={{ color: isDark ? "#a1a1aa" : "#6b7280" }}
              className="text-sm text-center mb-8 px-4 leading-5"
            >
              {subtitle}
            </Text>

            <View className="mb-6">
              <Text
                style={{ color: isDark ? "#a1a1aa" : "#6b7280" }}
                className="text-xs mb-2 px-1"
              >
                Phone Number
              </Text>
              <View
                style={{
                  backgroundColor: isDark ? "#18181b" : "#f9fafb",
                  borderColor: isDark ? "#27272a" : "#d1d5db",
                }}
                className="h-12 px-4 rounded-lg border flex-row items-center"
              >
                <Text
                  style={{ color: isDark ? "#71717a" : "#6b7280" }}
                  className="text-sm mr-2"
                >
                  +
                </Text>
                <TextInput
                  style={{
                    color: isDark ? "#ffffff" : "#000000",
                    paddingVertical: 0,
                  }}
                  className="flex-1 text-sm"
                  placeholder="1234567890"
                  placeholderTextColor="#9ca3af"
                  value={phoneNumber}
                  onChangeText={handlePhoneChange}
                  keyboardType="phone-pad"
                  autoFocus
                  autoCorrect={false}
                />
              </View>
              <Text
                style={{ color: isDark ? "#71717a" : "#6b7280" }}
                className="text-xs mt-2 px-1"
              >
                Include country code (e.g., 1 for US)
              </Text>
            </View>

            {error ? (
              <Text className="text-red-500 text-xs text-center mb-4">
                {error}
              </Text>
            ) : null}

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.7}
              className="bg-blue-500 h-12 rounded-lg items-center justify-center mb-3"
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text className="text-white font-bold text-sm">
                  {submitText}
                </Text>
              )}
            </TouchableOpacity>

            {showSkip && (
              <TouchableOpacity
                onPress={handleSkip}
                disabled={loading}
                activeOpacity={0.7}
                className="py-3"
              >
                <Text className="text-blue-500 text-sm text-center font-semibold">
                  {skipText}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View className="pb-6">
            <Text
              style={{ color: isDark ? "#71717a" : "#6b7280" }}
              className="text-xs text-center px-8 leading-4"
            >
              Your phone number will be used to help friends find you and sync
              contacts. You can change this later in settings.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
