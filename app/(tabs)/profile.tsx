import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const ProfileScreen = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <HStack>
        <Text>Profile Screen</Text>
      </HStack>
    </SafeAreaView>
  );
};

export default ProfileScreen;
