import { SearchBar } from "@/components/search/SearchBar";
import { SearchResultItem } from "@/components/search/SearchResultItem";
import { MessageSearchResult, searchMessagesGlobal } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";

export default function GlobalSearchScreen() {
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
    // Navigate to the chat with this message
    console.log("Navigate to message:", result.id);
    // TODO: Implement navigation to specific message in chat
  };

  const renderResult = ({ item }: { item: MessageSearchResult }) => (
    <SearchResultItem
      result={item}
      searchQuery={searchQuery}
      onPress={() => handleResultPress(item)}
    />
  );

  const renderEmpty = () => {
    if (loading) {
      return (
        <View className="flex-1 items-center justify-center py-12">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-500 dark:text-gray-400 mt-4">
            Searching...
          </Text>
        </View>
      );
    }

    if (!hasSearched) {
      return (
        <View className="flex-1 items-center justify-center px-8 py-12">
          <View className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mb-4">
            <Ionicons name="search" size={40} color="#9CA3AF" />
          </View>
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">
            Search Messages
          </Text>
          <Text className="text-base text-gray-500 dark:text-gray-400 text-center">
            Search across all your chats and groups
          </Text>
        </View>
      );
    }

    return (
      <View className="flex-1 items-center justify-center px-8 py-12">
        <View className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mb-4">
          <Ionicons name="search-outline" size={40} color="#9CA3AF" />
        </View>
        <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">
          No Results Found
        </Text>
        <Text className="text-base text-gray-500 dark:text-gray-400 text-center">
          Try searching with different keywords
        </Text>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-950">
      {/* Header */}
      <View className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <View className="flex-row items-center px-4 py-3">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center -ml-2"
          >
            <Ionicons name="chevron-back" size={28} color="#007AFF" />
          </Pressable>
          <Text className="text-xl font-semibold text-gray-900 dark:text-white ml-2">
            Search Messages
          </Text>
        </View>

        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder="Search in all chats"
          autoFocus
        />
      </View>

      {/* Results */}
      <FlatList
        data={results}
        renderItem={renderResult}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          results.length === 0 ? { flex: 1 } : undefined
        }
        ListEmptyComponent={renderEmpty}
      />

      {/* Results Count */}
      {hasSearched && results.length > 0 && (
        <View className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 py-2">
          <Text className="text-sm text-gray-500 dark:text-gray-400 text-center">
            {results.length} result{results.length !== 1 ? "s" : ""} found
          </Text>
        </View>
      )}
    </View>
  );
}
