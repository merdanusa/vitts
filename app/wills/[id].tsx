import {
  deleteWill,
  getCurrentUser,
  getWillById,
  likeWill,
  shareWill,
  togglePinWill,
  unlikeWill,
  Will,
} from "@/services/api";
import { RootState } from "@/store";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ChevronLeft,
  Edit,
  Heart,
  MessageCircle,
  MoreVertical,
  Pin,
  Share2,
  Trash2,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

export default function WillDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const isDark = useSelector((state: RootState) => state.theme.isDark);
  const [will, setWill] = useState<Will | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    loadCurrentUser();

    const willId = Array.isArray(id) ? id[0] : id;

    if (
      willId &&
      typeof willId === "string" &&
      willId !== "undefined" &&
      willId !== "null"
    ) {
      loadWill(willId);
    } else {
      console.error("No valid will ID provided:", id);
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const willId = Array.isArray(id) ? id[0] : id;

    if (!willId) {
      console.error("No valid will ID provided:", id);
      setLoading(false);
      return;
    }

    const fetchWill = async () => {
      try {
        setLoading(true);
        const data = await getWillById(willId);
        setWill(data);
      } catch (error) {
        console.error("Failed to load will:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWill();
  }, [id]);

  const loadCurrentUser = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUserId(user.id);
    } catch (error) {
      console.error("Failed to load current user:", error);
    }
  };

  const loadWill = async (willId: string) => {
    if (!willId || willId === "undefined" || willId === "null") {
      console.error("Invalid will ID:", willId);
      Alert.alert("Error", "Invalid will ID");
      router.back();
      return;
    }

    try {
      setLoading(true);
      const data = await getWillById(willId);
      setWill(data);
    } catch (error) {
      console.error("Failed to load will:", error);
      Alert.alert("Error", "Failed to load will");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!will) return;

    const wasLiked = isLiked;
    setIsLiked(!isLiked);
    setWill({
      ...will,
      likesCount: wasLiked ? will.likesCount - 1 : will.likesCount + 1,
    });

    try {
      if (wasLiked) {
        await unlikeWill(will.id);
      } else {
        await likeWill(will.id);
      }
    } catch (error) {
      setIsLiked(wasLiked);
      setWill({
        ...will,
        likesCount: wasLiked ? will.likesCount + 1 : will.likesCount - 1,
      });
      Alert.alert("Error", "Failed to update like");
    }
  };

  const handleShare = async () => {
    if (!will) return;

    try {
      await shareWill(will.id);
      setWill({ ...will, sharesCount: will.sharesCount + 1 });
      Alert.alert("Success", "Will shared successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to share will");
    }
  };

  const handleEdit = () => {
    setShowMenu(false);
    router.push(`/wills/manage?id=${will?.id}`);
  };

  const handleDelete = () => {
    setShowMenu(false);
    Alert.alert("Delete Will", "Are you sure you want to delete this will?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            if (will) {
              await deleteWill(will.id);
              Alert.alert("Success", "Will deleted successfully");
              router.back();
            }
          } catch (error) {
            Alert.alert("Error", "Failed to delete will");
          }
        },
      },
    ]);
  };

  const handleTogglePin = async () => {
    if (!will) return;
    setShowMenu(false);

    try {
      const updated = await togglePinWill(will.id);
      setWill(updated);
      Alert.alert(
        "Success",
        updated.isPinned ? "Will pinned successfully" : "Will unpinned",
      );
    } catch (error) {
      Alert.alert("Error", "Failed to toggle pin");
    }
  };

  const isOwner = will && currentUserId && will.authorId === currentUserId;

  if (loading) {
    return (
      <SafeAreaView
        style={{ backgroundColor: isDark ? "#000000" : "#ffffff" }}
        className="flex-1"
      >
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="small" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  if (!will) {
    return (
      <SafeAreaView
        style={{ backgroundColor: isDark ? "#000000" : "#ffffff" }}
        className="flex-1"
      >
        <View className="flex-1 items-center justify-center">
          <Text style={{ color: isDark ? "#8e8e93" : "#9ca3af" }}>
            Will not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ backgroundColor: isDark ? "#000000" : "#ffffff" }}
      className="flex-1"
    >
      <View
        style={{
          borderBottomWidth: 0.5,
          borderBottomColor: isDark ? "#2c2c2e" : "#e5e7eb",
        }}
        className="flex-row justify-between items-center px-4 py-3"
      >
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <ChevronLeft size={24} color={isDark ? "#ffffff" : "#000000"} />
        </TouchableOpacity>
        <Text
          style={{ color: isDark ? "#ffffff" : "#000000" }}
          className="text-lg font-semibold"
        >
          Will
        </Text>
        {isOwner ? (
          <TouchableOpacity
            onPress={() => setShowMenu(!showMenu)}
            activeOpacity={0.7}
          >
            <MoreVertical size={24} color={isDark ? "#ffffff" : "#000000"} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>

      {showMenu && isOwner && (
        <View
          style={{
            position: "absolute",
            top: 60,
            right: 16,
            backgroundColor: isDark ? "#1c1c1e" : "#ffffff",
            borderRadius: 12,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
            zIndex: 50,
            overflow: "hidden",
            borderWidth: 0.5,
            borderColor: isDark ? "#2c2c2e" : "#e5e7eb",
          }}
        >
          <TouchableOpacity
            onPress={handleEdit}
            className="flex-row items-center px-4 py-3 space-x-2"
            activeOpacity={0.7}
          >
            <Edit size={18} color="#007AFF" />
            <Text style={{ color: isDark ? "#ffffff" : "#000000" }}>Edit</Text>
          </TouchableOpacity>

          <View
            style={{
              height: 0.5,
              backgroundColor: isDark ? "#2c2c2e" : "#e5e7eb",
            }}
          />

          <TouchableOpacity
            onPress={handleTogglePin}
            className="flex-row items-center px-4 py-3 space-x-2"
            activeOpacity={0.7}
          >
            <Pin size={18} color="#007AFF" />
            <Text style={{ color: isDark ? "#ffffff" : "#000000" }}>
              {will.isPinned ? "Unpin" : "Pin"}
            </Text>
          </TouchableOpacity>

          <View
            style={{
              height: 0.5,
              backgroundColor: isDark ? "#2c2c2e" : "#e5e7eb",
            }}
          />

          <TouchableOpacity
            onPress={handleDelete}
            className="flex-row items-center px-4 py-3 space-x-2"
            activeOpacity={0.7}
          >
            <Trash2 size={18} color="#ef4444" />
            <Text style={{ color: "#ef4444" }}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4">
          {will.isPinned && (
            <View
              style={{
                backgroundColor: isDark ? "#1c1c1e" : "#eff6ff",
              }}
              className="rounded-xl p-3 mb-4 flex-row items-center space-x-2"
            >
              <Pin size={16} color="#007AFF" />
              <Text style={{ color: "#007AFF" }} className="font-medium">
                Pinned Will
              </Text>
            </View>
          )}

          <View className="flex-row space-x-3 mb-4">
            <Image
              source={{ uri: will.authorAvatar }}
              style={{ width: 48, height: 48, borderRadius: 24 }}
            />

            <View className="flex-1">
              <Text
                style={{ color: isDark ? "#ffffff" : "#000000" }}
                className="font-semibold text-base"
              >
                {will.authorName}
              </Text>
              <Text
                style={{ color: isDark ? "#8e8e93" : "#6b7280" }}
                className="text-sm"
              >
                {new Date(will.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>

            {will.category && (
              <View
                style={{
                  backgroundColor: isDark ? "#1c1c1e" : "#eff6ff",
                }}
                className="px-3 py-1 rounded-full self-start"
              >
                <Text
                  style={{ color: "#007AFF" }}
                  className="text-xs font-medium capitalize"
                >
                  {will.category}
                </Text>
              </View>
            )}
          </View>

          <Text
            style={{ color: isDark ? "#ffffff" : "#000000" }}
            className="text-lg mb-4 leading-6"
          >
            {will.content}
          </Text>

          {will.media && will.media.length > 0 && (
            <View className="mb-4 rounded-2xl overflow-hidden">
              {will.media[0].type === "image" && (
                <Image
                  source={{ uri: will.media[0].url }}
                  style={{ width: "100%", height: 300 }}
                  className="rounded-2xl"
                />
              )}
            </View>
          )}

          {will.tone && (
            <View className="mb-4">
              <Text
                style={{ color: isDark ? "#8e8e93" : "#6b7280" }}
                className="text-sm"
              >
                Tone:{" "}
                <Text
                  style={{ color: isDark ? "#ffffff" : "#000000" }}
                  className="capitalize"
                >
                  {will.tone}
                </Text>
              </Text>
            </View>
          )}

          {will.tags && will.tags.length > 0 && (
            <View className="flex-row flex-wrap gap-2 mb-4">
              {will.tags.map((tag, index) => (
                <View
                  key={`tag-${index}`}
                  style={{
                    backgroundColor: isDark ? "#1c1c1e" : "#eff6ff",
                  }}
                  className="px-3 py-1 rounded-full"
                >
                  <Text style={{ color: "#007AFF" }} className="text-sm">
                    #{tag}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <View
            style={{
              borderTopWidth: 0.5,
              borderTopColor: isDark ? "#2c2c2e" : "#e5e7eb",
            }}
            className="pt-4 mt-4"
          >
            <View className="flex-row justify-around items-center">
              <TouchableOpacity
                onPress={handleLike}
                className="flex-row items-center space-x-2"
                activeOpacity={0.7}
              >
                <Heart
                  size={24}
                  color={isLiked ? "#ef4444" : isDark ? "#8e8e93" : "#6b7280"}
                  fill={isLiked ? "#ef4444" : "transparent"}
                />
                <Text
                  style={{
                    color: isLiked ? "#ef4444" : isDark ? "#8e8e93" : "#6b7280",
                  }}
                  className="text-base font-medium"
                >
                  {will.likesCount}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center space-x-2"
                activeOpacity={0.7}
              >
                <MessageCircle
                  size={24}
                  color={isDark ? "#8e8e93" : "#6b7280"}
                />
                <Text
                  style={{ color: isDark ? "#8e8e93" : "#6b7280" }}
                  className="text-base font-medium"
                >
                  {will.commentsCount}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleShare}
                className="flex-row items-center space-x-2"
                activeOpacity={0.7}
              >
                <Share2 size={24} color={isDark ? "#8e8e93" : "#6b7280"} />
                <Text
                  style={{ color: isDark ? "#8e8e93" : "#6b7280" }}
                  className="text-base font-medium"
                >
                  {will.sharesCount}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View
            style={{
              borderTopWidth: 0.5,
              borderTopColor: isDark ? "#2c2c2e" : "#e5e7eb",
            }}
            className="mt-4 pt-4"
          >
            <Text
              style={{ color: isDark ? "#8e8e93" : "#6b7280" }}
              className="text-sm"
            >
              Visibility:{" "}
              <Text
                style={{ color: isDark ? "#ffffff" : "#000000" }}
                className="capitalize"
              >
                {will.visibility}
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
