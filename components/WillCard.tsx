import { Will } from "@/services/api";
import { useRouter } from "expo-router";
import { Edit, Heart, MessageCircle, Share2 } from "lucide-react-native";
import { Image, Pressable, Text, TouchableOpacity, View } from "react-native";

interface WillCardProps {
  item: Will;
  isDark: boolean;
  isLiked: boolean;
  onLike: (willId: string) => void;
  showEdit?: boolean;
  onEdit?: (willId: string) => void;
  hideAuthor?: boolean;
}

export function WillCard({
  item,
  isDark,
  isLiked,
  onLike,
  showEdit = false,
  onEdit,
  hideAuthor = false,
}: WillCardProps) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/wills/${item.id}`)}
      style={{
        borderBottomWidth: 0.5,
        borderBottomColor: isDark ? "#2c2c2e" : "#e5e7eb",
        backgroundColor: isDark ? "#000000" : "#ffffff",
      }}
      className="px-4 py-3"
    >
      <View className="flex-row space-x-3">
        {!hideAuthor && (
          <Image
            source={{ uri: item.authorAvatar }}
            className="w-10 h-10 rounded-full"
            alt={item.authorName}
          />
        )}

        <View className="flex-1">
          {!hideAuthor && (
            <View className="flex-row items-center justify-between mb-1">
              <View className="flex-1">
                <Text
                  style={{ color: isDark ? "#ffffff" : "#000000" }}
                  className="font-semibold text-sm"
                >
                  {item.authorName}
                </Text>
                <Text
                  style={{ color: isDark ? "#8e8e93" : "#6b7280" }}
                  className="text-xs"
                >
                  @{item.authorName.toLowerCase().replace(/\s/g, "")} ·{" "}
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>

              {item.category && (
                <View
                  style={{ backgroundColor: isDark ? "#1c1c1e" : "#f3f4f6" }}
                  className="px-2 py-1 rounded-full ml-2"
                >
                  <Text
                    style={{ color: isDark ? "#8e8e93" : "#6b7280" }}
                    className="text-xs font-medium capitalize"
                  >
                    {item.category}
                  </Text>
                </View>
              )}
            </View>
          )}

          <Text
            style={{ color: isDark ? "#ffffff" : "#000000" }}
            className="text-sm mb-2 leading-5"
          >
            {item.content}
          </Text>

          {item.media && item.media.length > 0 && (
            <View className="mb-2 rounded-2xl overflow-hidden">
              {item.media[0].type === "image" && (
                <Image
                  source={{ uri: item.media[0].url }}
                  className="w-full h-64 rounded-2xl"
                  alt="Will media"
                />
              )}
            </View>
          )}

          {item.tags && item.tags.length > 0 && (
            <View className="flex-row flex-wrap gap-2 mb-2">
              {item.tags.map((tag, index) => (
                <Text
                  key={`tag-${item.id}-${index}`}
                  style={{ color: "#007AFF" }}
                  className="text-sm"
                >
                  #{tag}
                </Text>
              ))}
            </View>
          )}

          <View className="flex-row justify-between items-center mt-1">
            <View className="flex-row space-x-6">
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  onLike(item.id);
                }}
                className="flex-row items-center space-x-1"
              >
                <Heart
                  size={18}
                  color={isLiked ? "#ef4444" : isDark ? "#8e8e93" : "#6b7280"}
                  fill={isLiked ? "#ef4444" : "transparent"}
                />
                <Text
                  style={{
                    color: isLiked ? "#ef4444" : isDark ? "#8e8e93" : "#6b7280",
                  }}
                  className="text-sm"
                >
                  {item.likesCount}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity className="flex-row items-center space-x-1">
                <MessageCircle
                  size={18}
                  color={isDark ? "#8e8e93" : "#6b7280"}
                />
                <Text
                  style={{ color: isDark ? "#8e8e93" : "#6b7280" }}
                  className="text-sm"
                >
                  {item.commentsCount}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity className="flex-row items-center space-x-1">
                <Share2 size={18} color={isDark ? "#8e8e93" : "#6b7280"} />
                <Text
                  style={{ color: isDark ? "#8e8e93" : "#6b7280" }}
                  className="text-sm"
                >
                  {item.sharesCount}
                </Text>
              </TouchableOpacity>
            </View>

            {showEdit && onEdit && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  onEdit(item.id);
                }}
                style={{
                  backgroundColor: isDark ? "#1c1c1e" : "#f3f4f6",
                }}
                className="px-3 py-1.5 rounded-full flex-row items-center space-x-1"
              >
                <Edit size={14} color="#007AFF" />
                <Text
                  style={{ color: "#007AFF" }}
                  className="text-xs font-medium"
                >
                  Edit
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
}
