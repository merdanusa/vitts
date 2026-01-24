import { Text, TouchableOpacity, View } from "react-native";

export default function FriendSkeleton({ isDark }: { isDark: boolean }) {
  return (
    <View className="flex-row items-center justify-between py-3">
      <View className="flex-row items-center flex-1">
        <View
          style={{
            backgroundColor: isDark ? "#262626" : "#e5e7eb",
          }}
          className="w-12 h-12 rounded-full mr-3"
        />
        <View className="flex-1">
          <View
            style={{
              backgroundColor: isDark ? "#262626" : "#e5e7eb",
              width: "60%",
            }}
            className="h-4 rounded mb-2"
          />
          <View
            style={{
              backgroundColor: isDark ? "#1f1f1f" : "#f3f4f6",
              width: "40%",
            }}
            className="h-3 rounded"
          />
        </View>
      </View>
      <TouchableOpacity
        style={{
          backgroundColor: "#3b82f6",
        }}
        className="px-6 py-1.5 rounded-lg"
      >
        <Text className="text-white text-sm font-semibold">Add</Text>
      </TouchableOpacity>
    </View>
  );
}
