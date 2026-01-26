import { updateProfile } from "@/services/api";
import { RootState } from "@/store";
import { setUser } from "@/store/userSlice";
import { useRouter } from "expo-router";
import React from "react";
import { Alert } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import PhoneNumberInputScreen from "./PhoneNumberInput";

export default function PhoneSettingsScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);

  const handleSubmit = async (phoneNumber: string) => {
    try {
      const updatedUser = await updateProfile({ phoneNumber });
      dispatch(setUser(updatedUser));

      Alert.alert(
        "Success",
        "Phone number added successfully! You can now sync contacts.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ],
      );
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to update phone number",
      );
    }
  };

  const handleSkip = () => {
    router.back();
  };

  return (
    <PhoneNumberInputScreen
      title={user?.phoneNumber ? "Update Phone Number" : "Add Phone Number"}
      subtitle="Add your phone number to sync contacts and let friends find you easily"
      onSubmit={handleSubmit}
      onSkip={handleSkip}
      skipText={user?.phoneNumber ? "Cancel" : "Skip for now"}
      submitText={user?.phoneNumber ? "Update" : "Add Phone Number"}
      showSkip={true}
      initialValue={user?.phoneNumber || ""}
    />
  );
}
