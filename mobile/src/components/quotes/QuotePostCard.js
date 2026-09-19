import { useState } from "react";
import { View, Text, Image, Pressable, FlatList, Dimensions, Share } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

function ReadMoreSlide({ width, height, colors, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        width,
        height,
        backgroundColor: colors.accentSoft,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 32,
      }}
    >
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: colors.accent,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <Ionicons name="arrow-forward" size={24} color={colors.accentText} />
      </View>
      <Text style={{ color: colors.textPrimary, fontSize: 17, fontWeight: "700", textAlign: "center", marginBottom: 6 }}>
        Read More
      </Text>
      <Text style={{ color: colors.textSecondary, fontSize: 13, textAlign: "center" }}>
        See all quotes and carousels
      </Text>
    </Pressable>
  );
}

export default function QuotePostCard({
  post,
  onToggleSave,
  onOpenComments,
  onReadMore,
  showReadMore = false,
  imageHeight = 420,
  cardWidth,
  style,
}) {
  const { colors } = useTheme();
  const [index, setIndex] = useState(0);
  const width = cardWidth || SCREEN_WIDTH - 40;

  const images = post.images || [];
  const isCarousel = images.length > 1;
  const slides = showReadMore ? [...images, { __readMore: true }] : images;
  const totalSlides = slides.length;

  const onShare = () => {
    const uri = images[0]?.imageUrl;
    Share.share({ url: uri, message: uri });
  };

  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: 20,
          overflow: "hidden",
        },
        style,
      ]}
    >
      <View style={{ width, height: imageHeight }}>
        <FlatList
          data={slides}
          keyExtractor={(item, i) => (item.__readMore ? "read-more" : item.id || String(i))}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={isCarousel || showReadMore}
          onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
          renderItem={({ item }) =>
            item.__readMore ? (
              <ReadMoreSlide width={width} height={imageHeight} colors={colors} onPress={() => onReadMore?.(post)} />
            ) : (
              <Image source={{ uri: item.imageUrl }} style={{ width, height: imageHeight }} resizeMode="cover" />
            )
          }
        />

        {totalSlides > 1 && (
          <View
            style={{
              position: "absolute",
              top: 14,
              right: 14,
              backgroundColor: "rgba(0,0,0,0.55)",
              borderRadius: 999,
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "700" }}>
              {index + 1}/{totalSlides}
            </Text>
          </View>
        )}

        {totalSlides > 1 && (
          <View
            style={{
              position: "absolute",
              bottom: 14,
              left: 0,
              right: 0,
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            {slides.map((_, i) => (
              <View
                key={i}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  marginHorizontal: 3,
                  backgroundColor: i === index ? "#FFFFFF" : "rgba(255,255,255,0.4)",
                }}
              />
            ))}
          </View>
        )}
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: colors.surfaceAlt,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {post.commentsEnabled && (
            <Pressable
              onPress={() => onOpenComments(post)}
              style={{ flexDirection: "row", alignItems: "center", marginRight: 22 }}
            >
              <Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />
              <Text style={{ color: colors.textSecondary, fontSize: 13, marginLeft: 6, fontWeight: "500" }}>
                {post.commentCount || 0}
              </Text>
            </Pressable>
          )}

          <Pressable onPress={onShare} style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="paper-plane-outline" size={19} color={colors.textSecondary} />
          </Pressable>
        </View>

        <Pressable onPress={() => onToggleSave(post)}>
          <Ionicons
            name={post.isSaved ? "bookmark" : "bookmark-outline"}
            size={21}
            color={post.isSaved ? colors.accent : colors.textSecondary}
          />
        </Pressable>
      </View>
    </View>
  );
}
