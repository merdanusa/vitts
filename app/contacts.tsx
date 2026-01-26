import { AppDispatch, RootState } from "@/store";
import {
  fetchMyContacts,
  performFullSync,
  selectContactsStats,
  selectFilteredContacts,
  setSearchQuery,
  toggleShowFavorites,
} from "@/store/contactsSlice";
import { useRouter } from "expo-router";
import {
  ChevronRight,
  RefreshCw,
  Search,
  Star,
  UserPlus,
} from "lucide-react-native";
import React, { useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Platform,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

interface Contact {
  id: string;
  name: string;
  login: string;
  avatar: string;
  isOnline: boolean;
  isFavorite?: boolean;
  isBlocked?: boolean;
  addedAt?: string;
}

const getInitials = (name: string): string => {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const ContactsScreen = () => {
  const isDark = useSelector((state: RootState) => state.theme.isDark);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  // Redux state
  const contacts = useSelector(selectFilteredContacts);
  const stats = useSelector(selectContactsStats);
  const searchQuery = useSelector(
    (state: RootState) => state.contacts.searchQuery,
  );
  const loading = useSelector(
    (state: RootState) => state.contacts.myContactsLoading,
  );
  const syncing = useSelector((state: RootState) => state.contacts.syncing);
  const showOnlyFavorites = useSelector(
    (state: RootState) => state.contacts.showOnlyFavorites,
  );

  // Load contacts on mount
  useEffect(() => {
    dispatch(fetchMyContacts());
  }, [dispatch]);

  const handleRefresh = useCallback(() => {
    dispatch(fetchMyContacts());
  }, [dispatch]);

  const handleSyncContacts = useCallback(async () => {
    try {
      console.log("[CONTACTS] Starting full sync...");
      await dispatch(performFullSync()).unwrap();

      Alert.alert(
        "Sync Complete",
        `Found ${stats.registered} contacts using this app!`,
      );
    } catch (error: any) {
      console.error("[CONTACTS] Sync error:", error);

      if (error.includes("Permission denied")) {
        Alert.alert(
          "Permission Required",
          "Please grant contacts permission in your device settings to sync contacts.",
        );
      } else {
        Alert.alert("Sync Failed", error || "Failed to sync contacts");
      }
    }
  }, [dispatch, stats.registered]);

  const handleSearchChange = useCallback(
    (text: string) => {
      dispatch(setSearchQuery(text));
    },
    [dispatch],
  );

  const handleToggleFavorites = useCallback(() => {
    dispatch(toggleShowFavorites());
  }, [dispatch]);

  const handleContactPress = useCallback(
    (contactId: string) => {
      router.push(`/chats/${contactId}`);
    },
    [router],
  );

  const renderContactItem = useCallback(
    ({ item }: { item: Contact }) => {
      const initials = getInitials(item.name);
      const hasAvatar =
        item.avatar &&
        item.avatar !== "M" &&
        item.avatar !== "" &&
        item.avatar !== "default-avatar-url.jpg";

      return (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => handleContactPress(item.id)}
          style={{
            backgroundColor: isDark ? "#000000" : "#ffffff",
            borderBottomWidth: 0.5,
            borderBottomColor: isDark ? "#1a1a1a" : "#f3f4f6",
          }}
          className="px-4 py-3"
        >
          <View className="flex-row items-center">
            <View className="mr-3 relative">
              {hasAvatar ? (
                <Image
                  source={{ uri: item.avatar }}
                  style={{ width: 48, height: 48, borderRadius: 24 }}
                />
              ) : (
                <View
                  style={{
                    backgroundColor: isDark ? "#262626" : "#f3f4f6",
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                  }}
                  className="items-center justify-center"
                >
                  <Text
                    style={{ color: isDark ? "#a1a1aa" : "#737373" }}
                    className="text-lg font-medium"
                  >
                    {initials}
                  </Text>
                </View>
              )}
              {item.isOnline && (
                <View
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: 12,
                    height: 12,
                    backgroundColor: "#22c55e",
                    borderRadius: 6,
                    borderWidth: 2,
                    borderColor: isDark ? "#000000" : "#ffffff",
                  }}
                />
              )}
            </View>

            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                {item.isFavorite && (
                  <Star size={14} color="#fbbf24" fill="#fbbf24" />
                )}
                <Text
                  style={{ color: isDark ? "#ffffff" : "#000000" }}
                  className="font-semibold text-base flex-1"
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
              </View>
              <Text
                style={{ color: isDark ? "#737373" : "#a1a1aa" }}
                className="text-sm mt-0.5"
                numberOfLines={1}
              >
                @{item.login}
              </Text>
            </View>

            <ChevronRight size={20} color={isDark ? "#737373" : "#a1a1aa"} />
          </View>
        </TouchableOpacity>
      );
    },
    [isDark, handleContactPress],
  );

  const keyExtractor = useCallback((item: Contact) => item.id, []);

  if (loading && contacts.length === 0) {
    return (
      <SafeAreaView
        style={{ backgroundColor: isDark ? "#000000" : "#ffffff" }}
        className="flex-1"
      >
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator
            size="small"
            color={isDark ? "#ffffff" : "#000000"}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ backgroundColor: isDark ? "#000000" : "#ffffff" }}
      className="flex-1"
    >
      <View className="flex-1">
        {/* Header */}
        <View
          style={{
            borderBottomWidth: 0.5,
            borderBottomColor: isDark ? "#1a1a1a" : "#f3f4f6",
          }}
          className="px-4 pt-2 pb-3"
        >
          <View className="flex-row justify-between items-center mb-3">
            <View>
              <Text
                style={{ color: isDark ? "#ffffff" : "#000000" }}
                className="text-3xl font-bold"
              >
                Contacts
              </Text>
              {stats.total > 0 && (
                <Text
                  style={{ color: isDark ? "#737373" : "#a1a1aa" }}
                  className="text-sm mt-1"
                >
                  {stats.total} {stats.total === 1 ? "contact" : "contacts"}
                  {stats.favorites > 0 && ` • ${stats.favorites} favorites`}
                </Text>
              )}
            </View>

            <View className="flex-row gap-2">
              {stats.favorites > 0 && (
                <TouchableOpacity
                  onPress={handleToggleFavorites}
                  style={{
                    backgroundColor: showOnlyFavorites
                      ? "#fbbf24"
                      : isDark
                        ? "#1a1a1a"
                        : "#f3f4f6",
                    padding: 8,
                    borderRadius: 8,
                  }}
                >
                  <Star
                    size={20}
                    color={showOnlyFavorites ? "#000000" : "#fbbf24"}
                    fill={showOnlyFavorites ? "#000000" : "none"}
                  />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={handleSyncContacts}
                disabled={syncing}
                style={{
                  backgroundColor: "#007AFF",
                  opacity: syncing ? 0.6 : 1,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 8,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {syncing ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <RefreshCw size={16} color="#ffffff" />
                )}
                <Text className="text-white font-semibold">Sync</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="relative">
            <View className="absolute left-3 top-2.5 z-10">
              <Search size={16} color={isDark ? "#737373" : "#a1a1aa"} />
            </View>
            <TextInput
              style={{
                backgroundColor: isDark ? "#1a1a1a" : "#f9fafb",
                color: isDark ? "#ffffff" : "#000000",
                borderWidth: 0.5,
                borderColor: isDark ? "#262626" : "#e5e7eb",
                ...(Platform.OS === "ios" ? { height: 36 } : {}),
              }}
              className="rounded-lg pl-10 pr-4 py-2 text-base"
              placeholder="Search contacts"
              placeholderTextColor={isDark ? "#737373" : "#a1a1aa"}
              value={searchQuery}
              onChangeText={handleSearchChange}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
          </View>
        </View>

        {/* Contacts List */}
        {contacts.length === 0 ? (
          <View className="flex-1 items-center justify-center px-8">
            <UserPlus
              size={48}
              color={isDark ? "#525252" : "#d4d4d8"}
              strokeWidth={1.5}
            />
            <Text
              style={{ color: isDark ? "#737373" : "#a1a1aa" }}
              className="text-base text-center mt-4"
            >
              {searchQuery
                ? "No contacts found"
                : showOnlyFavorites
                  ? "No favorite contacts yet"
                  : "No contacts yet"}
            </Text>
            {!searchQuery && !showOnlyFavorites && (
              <Text
                style={{ color: isDark ? "#525252" : "#d4d4d8" }}
                className="text-sm text-center mt-2"
              >
                Tap Sync to find friends from your phone contacts
              </Text>
            )}
          </View>
        ) : (
          <FlatList
            data={contacts}
            keyExtractor={keyExtractor}
            renderItem={renderContactItem}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={handleRefresh}
                tintColor={isDark ? "#ffffff" : "#000000"}
              />
            }
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default React.memo(ContactsScreen);
