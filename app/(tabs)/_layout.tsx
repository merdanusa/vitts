import { RootState } from "@/store";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { Image, View } from "react-native";
import { useSelector } from "react-redux";

export default function TabLayout() {
  const isAuthenticated = useSelector(
    (state: RootState) => state.user.isAuthenticated,
  );
  const isDark = useSelector((state: RootState) => state.theme.isDark);
  const userAvatar = useSelector((state: RootState) => state.user.avatar);

  if (!isAuthenticated) {
    return <Redirect href="/auth" />;
  }

  const activeColor = isDark ? "#ffffff" : "#000000";
  const inactiveColor = isDark ? "#737373" : "#a1a1aa";
  const tabBarBg = isDark ? "#000000" : "#ffffff";
  const borderColor = isDark ? "#262626" : "#dbdbdb";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: tabBarBg,
          borderTopWidth: 0.5,
          borderTopColor: borderColor,
          height: 68,
          paddingBottom: 34,
          paddingTop: 8,
          elevation: 0,
          shadowOpacity: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={26}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: "Discover",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "globe" : "globe-outline"}
              size={26}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: "Chats",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "paper-plane" : "paper-plane-outline"}
              size={26}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="vibecast"
        options={{
          title: "Vibecasts",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "videocam" : "videocam-outline"}
              size={26}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                overflow: "hidden",
                borderWidth: focused ? 2 : 0,
                borderColor: color,
              }}
            >
              {userAvatar && userAvatar !== "M" ? (
                <Image
                  source={{ uri: userAvatar }}
                  style={{
                    width: "100%",
                    height: "100%",
                  }}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: isDark ? "#262626" : "#f3f4f6",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons
                    name={focused ? "person" : "person-outline"}
                    size={16}
                    color={color}
                  />
                </View>
              )}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
