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
        borderBottomWidth: 1,
        borderBottomColor: isDark ? "#1c1c1e" : "#f0f0f0",
        backgroundColor: isDark ? "#000000" : "#ffffff",
      }}
      className="px-4 py-4"
    >
      <View className="flex-row gap-3">
        {!hideAuthor && (
          <Image
            source={{ uri: item.authorAvatar }}
            className="w-11 h-11 rounded-full"
            style={{
              borderWidth: 1,
              borderColor: isDark ? "#2c2c2e" : "#e5e7eb",
            }}
            alt={item.authorName}
          />
        )}

        <View className="flex-1">
          {!hideAuthor && (
            <View className="mb-2">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 flex-row items-center gap-2 mr-2">
                  <Text
                    style={{ color: isDark ? "#ffffff" : "#000000" }}
                    className="font-bold text-[15px]"
                  >
                    {item.authorName}
                  </Text>
                  {item.category && (
                    <View
                      style={{
                        backgroundColor: isDark ? "#1c1c1e" : "#f3f4f6",
                        borderWidth: 1,
                        borderColor: isDark ? "#2c2c2e" : "#e5e7eb",
                      }}
                      className="px-2.5 py-1 rounded-full"
                    >
                      <Text
                        style={{ color: isDark ? "#8e8e93" : "#6b7280" }}
                        className="text-[11px] font-semibold uppercase tracking-wide"
                      >
                        {item.category}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              <Text
                style={{ color: isDark ? "#8e8e93" : "#9ca3af" }}
                className="text-[13px] mt-0.5"
              >
                @{item.authorName.toLowerCase().replace(/\s/g, "")} ·{" "}
                {new Date(item.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </Text>
            </View>
          )}

          <Text
            style={{ color: isDark ? "#e5e5e7" : "#1c1c1e" }}
            className="text-[15px] leading-[21px] mb-3"
          >
            {item.content}
          </Text>

          {item.media && item.media.length > 0 && (
            <View
              className="mb-3 rounded-xl overflow-hidden"
              style={{
                borderWidth: 1,
                borderColor: isDark ? "#2c2c2e" : "#e5e7eb",
              }}
            >
              {item.media[0].type === "image" && (
                <Image
                  source={{ uri: item.media[0].url }}
                  className="w-full h-64"
                  resizeMode="cover"
                  alt="Will media"
                />
              )}
            </View>
          )}

          {item.tags && item.tags.length > 0 && (
            <View className="flex-row flex-wrap gap-2 mb-3">
              {item.tags.map((tag, index) => (
                <Text
                  key={`tag-${item.id}-${index}`}
                  style={{ color: "#007AFF" }}
                  className="text-[13px] font-medium"
                >
                  #{tag}
                </Text>
              ))}
            </View>
          )}

          <View
            className="flex-row justify-between items-center pt-1"
            style={{
              borderTopWidth: isDark ? 0 : 0.5,
              borderTopColor: "#f0f0f0",
              marginTop: 4,
              paddingTop: 8,
            }}
          >
            <View className="flex-row gap-6">
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  onLike(item.id);
                }}
                className="flex-row items-center gap-1.5 py-1 px-2 rounded-full"
                style={{
                  backgroundColor: isLiked
                    ? isDark
                      ? "#1c0f0f"
                      : "#fef2f2"
                    : "transparent",
                }}
              >
                <Heart
                  size={19}
                  color={isLiked ? "#ef4444" : isDark ? "#8e8e93" : "#9ca3af"}
                  fill={isLiked ? "#ef4444" : "transparent"}
                  strokeWidth={2}
                />
                <Text
                  style={{
                    color: isLiked ? "#ef4444" : isDark ? "#8e8e93" : "#6b7280",
                  }}
                  className="text-[13px] font-semibold"
                >
                  {item.likesCount}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity className="flex-row items-center gap-1.5 py-1 px-2">
                <MessageCircle
                  size={19}
                  color={isDark ? "#8e8e93" : "#9ca3af"}
                  strokeWidth={2}
                />
                <Text
                  style={{ color: isDark ? "#8e8e93" : "#6b7280" }}
                  className="text-[13px] font-semibold"
                >
                  {item.commentsCount}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity className="flex-row items-center gap-1.5 py-1 px-2">
                <Share2
                  size={19}
                  color={isDark ? "#8e8e93" : "#9ca3af"}
                  strokeWidth={2}
                />
                <Text
                  style={{ color: isDark ? "#8e8e93" : "#6b7280" }}
                  className="text-[13px] font-semibold"
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
                  backgroundColor: "#007AFF",
                }}
                className="px-3 py-2 rounded-lg flex-row items-center gap-1.5"
              >
                <Edit size={14} color="#ffffff" strokeWidth={2.5} />
                <Text
                  style={{ color: "#ffffff" }}
                  className="text-[13px] font-bold"
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
