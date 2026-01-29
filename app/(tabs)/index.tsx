import { WillCard } from "@/components/WillCard";
import { getAllWills, likeWill, unlikeWill, Will } from "@/services/api";
import { RootState } from "@/store";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

export default function HomeScreen() {
  const router = useRouter();
  const isDark = useSelector((state: RootState) => state.theme.isDark);
  const [wills, setWills] = useState<Will[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [likedWills, setLikedWills] = useState<Set<string>>(new Set());

  const loadWills = async (pageNum: number = 1, append: boolean = false) => {
    try {
      if (!append) setLoading(true);
      const response = await getAllWills({ page: pageNum, limit: 10 });

      if (append) {
        setWills((prev) => {
          const existingIds = new Set(prev.map((w) => w.id));
          const newUniqueWills = response.data.filter(
            (w) => !existingIds.has(w.id),
          );
          return [...prev, ...newUniqueWills];
        });
      } else {
        setWills(response.data);
      }

      setHasMore(pageNum < response.pagination.pages);
    } catch (error) {
      console.error("Failed to load wills:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadWills();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    loadWills(1, false);
  }, []);

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadWills(nextPage, true);
    }
  };

  const handleLike = async (willId: string) => {
    const isLiked = likedWills.has(willId);

    setLikedWills((prev) => {
      const newSet = new Set(prev);
      if (isLiked) {
        newSet.delete(willId);
      } else {
        newSet.add(willId);
      }
      return newSet;
    });

    setWills((prev) =>
      prev.map((will) =>
        will.id === willId
          ? {
              ...will,
              likesCount: isLiked ? will.likesCount - 1 : will.likesCount + 1,
            }
          : will,
      ),
    );

    try {
      if (isLiked) {
        await unlikeWill(willId);
      } else {
        await likeWill(willId);
      }
    } catch (error) {
      setLikedWills((prev) => {
        const newSet = new Set(prev);
        if (isLiked) {
          newSet.add(willId);
        } else {
          newSet.delete(willId);
        }
        return newSet;
      });

      setWills((prev) =>
        prev.map((will) =>
          will.id === willId
            ? {
                ...will,
                likesCount: isLiked ? will.likesCount + 1 : will.likesCount - 1,
              }
            : will,
        ),
      );
    }
  };

  const renderStoriesSection = () => (
    <View
      style={{
        borderBottomWidth: 0.5,
        borderBottomColor: isDark ? "#2c2c2e" : "#e5e7eb",
        backgroundColor: isDark ? "#000000" : "#ffffff",
      }}
      className="py-3"
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        <TouchableOpacity
          key="your-story"
          className="items-center mr-4"
          onPress={() => router.push("/wills/manage")}
        >
          <View
            style={{
              borderWidth: 2,
              borderColor: "#007AFF",
              borderStyle: "dashed",
              backgroundColor: isDark ? "#1c1c1e" : "#f9fafb",
            }}
            className="w-16 h-16 rounded-full items-center justify-center mb-1"
          >
            <Plus size={24} color="#007AFF" />
          </View>
          <Text
            style={{ color: isDark ? "#ffffff" : "#000000" }}
            className="text-xs"
          >
            Your Story
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderWillItem = ({ item }: { item: Will }) => (
    <WillCard
      item={item}
      isDark={isDark}
      isLiked={likedWills.has(item.id)}
      onLike={handleLike}
    />
  );

  const renderHeader = () => (
    <View>
      <View
        style={{
          borderBottomWidth: 0.5,
          borderBottomColor: isDark ? "#2c2c2e" : "#e5e7eb",
          backgroundColor: isDark ? "#000000" : "#ffffff",
        }}
        className="px-4 py-3"
      >
        <Text
          style={{ color: isDark ? "#ffffff" : "#000000" }}
          className="text-3xl font-bold"
        >
          Home
        </Text>
      </View>
      {renderStoriesSection()}
    </View>
  );

  const renderFooter = () => {
    if (!loading || page === 1) return null;
    return (
      <View className="py-4">
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) {
      return (
        <View className="items-center justify-center py-20">
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      );
    }
    return (
      <View className="items-center justify-center py-20 px-4">
        <Text
          style={{ color: isDark ? "#8e8e93" : "#9ca3af" }}
          className="text-center text-base mb-2"
        >
          No wills yet
        </Text>
        <Text
          style={{ color: isDark ? "#8e8e93" : "#9ca3af" }}
          className="text-center text-sm"
        >
          Be the first to share your wisdom
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={{ backgroundColor: isDark ? "#000000" : "#ffffff" }}
      className="flex-1"
    >
      <FlatList
        data={wills}
        renderItem={renderWillItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={10}
      />
    </SafeAreaView>
  );
}
