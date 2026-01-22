import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { SafeAreaView } from "react-native";

export default function HomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <HStack className="justify-center items-center flex-1">
        <Text className="font-bold text-center">Hello, World</Text>
      </HStack>
    </SafeAreaView>
  );
}
