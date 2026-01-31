import { SearchBar } from "@/components/search/SearchBar";
import { SearchResultItem } from "@/components/search/SearchResultItem";
import { MessageSearchResult, searchMessagesGlobal } from "@/services/api";
import { RootState } from "@/store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

export default function GlobalSearchScreen() {
  const isDark = useSelector((state: RootState) => state.theme.isDark);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<MessageSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    try {
      setLoading(true);
      const response = await searchMessagesGlobal(query.trim(), {
        limit: 50,
      });
      setResults(response.results);
      setHasSearched(true);
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResultPress = (result: MessageSearchResult) => {
    console.log("Navigate to message:", result.id);
    // TODO: Implement navigation to specific message in chat
  };

  const renderResult = ({ item, index }: { item: MessageSearchResult; index: number }) => (
    <TouchableOpacity
      key={item.id}
      activeOpacity={0.7}
      onPress={() => handleResultPress(item)}
      style={{
        backgroundColor: isDark ? "#000000" : "#ffffff",
        borderBottomWidth: index < results.length - 1 ? 0.5 : 0,
        borderBottomColor: isDark ? "#1a1a1a" : "#f3f4f6",
      }}
      className="px-4 py-3"
    >
      <SearchResultItem
        result={item}
        searchQuery={searchQuery}
        onPress={() => handleResultPress(item)}
      />
    </TouchableOpacity>
  );

  const keyExtractor = (item: MessageSearchResult) => item.id;

  const renderEmpty = () => {
    if (loading) {
      return (
        <View className="flex-1 items-center justify-center py-12">
          <ActivityIndicator
            size="small"
            color={isDark ? "#ffffff" : "#000000"}
          />
          <Text
            style={{ color: isDark ? "#737373" : "#a1a1aa" }}
            className="mt-4 text-base"
          >
            Searching...
          </Text>
        </View>
      );
    }

    if (!hasSearched) {
      return (
        <View className="flex-1 items-center justify-center px-8 py-12">
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: isDark ? "#1a1a1a" : "#f3f4f6",
            }}
            className="items-center justify-center mb-4"
          >
            <Ionicons
              name="search"
              size={40}
              color={isDark ? "#525252" : "#d4d4d8"}
            />
          </View>
          <Text
            style={{ color: isDark ? "#ffffff" : "#000000" }}
            className="text-lg font-semibold mb-2 text-center"
          >
            Search Messages
          </Text>
          <Text
            style={{ color: isDark ? "#737373" : "#a1a1aa" }}
            className="text-base text-center"
          >
            Search across all your chats and groups
          </Text>
        </View>
      );
    }

    return (
      <View className="flex-1 items-center justify-center px-8 py-12">
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: isDark ? "#1a1a1a" : "#f3f4f6",
          }}
          className="items-center justify-center mb-4"
        >
          <Ionicons
            name="search-outline"
            size={40}
            color={isDark ? "#525252" : "#d4d4d8"}
          />
        </View>
        <Text
          style={{ color: isDark ? "#ffffff" : "#000000" }}
          className="text-lg font-semibold mb-2 text-center"
        >
          No Results Found
        </Text>
        <Text
          style={{ color: isDark ? "#737373" : "#a1a1aa" }}
          className="text-base text-center"
        >
          Try searching with different keywords
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={{ backgroundColor: isDark ? "#000000" : "#ffffff" }}
      className="flex-1"
    >
      {/* Header */}
      <View
        style={{
          borderBottomWidth: 0.5,
          borderBottomColor: isDark ? "#1a1a1a" : "#f3f4f6",
        }}
        className="px-4 py-3"
      >
        <View className="flex-row items-center mb-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center -ml-2"
          >
            <Ionicons name="chevron-back" size={28} color="#007AFF" />
          </TouchableOpacity>
          <Text
            style={{ color: isDark ? "#ffffff" : "#000000" }}
            className="text-xl font-semibold ml-2"
          >
            Search Messages
          </Text>
        </View>

        {/* Search Bar */}
        <View className="relative">
          <View className="absolute left-3 top-2.5 z-10">
            <Ionicons
              name="search"
              size={16}
              color={isDark ? "#737373" : "#a1a1aa"}
            />
          </View>
          <TextInput
            value={searchQuery}
            onChangeText={handleSearch}
            placeholder="Search in all chats"
            placeholderTextColor={isDark ? "#737373" : "#a1a1aa"}
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            style={{
              backgroundColor: isDark ? "#1a1a1a" : "#f9fafb",
              color: isDark ? "#ffffff" : "#000000",
              borderWidth: 0.5,
              borderColor: isDark ? "#262626" : "#e5e7eb",
              ...(Platform.OS === "ios" ? { height: 36 } : {}),
            }}
            className="rounded-lg pl-10 pr-4 py-2 text-base"
          />
        </View>
      </View>

      {/* Results */}
      <FlatList
        data={results}
        renderItem={renderResult}
        keyExtractor={keyExtractor}
        contentContainerStyle={
          results.length === 0 ? { flex: 1 } : undefined
        }
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        windowSize={10}
      />

      {/* Results Count */}
      {hasSearched && results.length > 0 && (
        <View
          style={{
            borderTopWidth: 0.5,
            borderTopColor: isDark ? "#1a1a1a" : "#f3f4f6",
          }}
          className="px-4 py-2"
        >
          <Text
            style={{ color: isDark ? "#737373" : "#a1a1aa" }}
            className="text-sm text-center"
          >
            {results.length} result{results.length !== 1 ? "s" : ""} found
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
