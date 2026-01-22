import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const VibecastScreen = () => {
  return (
    <SafeAreaView className="flex-1">
      <HStack>
        <Text>VibecastScreen</Text>
      </HStack>
    </SafeAreaView>
  );
};

export default VibecastScreen;
