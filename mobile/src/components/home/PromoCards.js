import { View, Text, Pressable, Image, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeContext";

function PromoCard({ card }) {
  const { colors } = useTheme();
  const tappable = !!card.linkUrl;

  const open = () => {
    if (card.linkUrl) Linking.openURL(card.linkUrl).catch(() => {});
  };

  return (
    <Pressable
      onPress={tappable ? open : undefined}
      style={({ pressed }) => ({
        borderRadius: 20,
        overflow: "hidden",
        marginBottom: 14,
        borderWidth: 1,
        borderColor: colors.accent,
        backgroundColor: colors.accentSoft,
        opacity: pressed && tappable ? 0.9 : 1,
      })}
    >
      {!!card.imageUrl && (
        <Image source={{ uri: card.imageUrl }} style={{ width: "100%", height: 140 }} resizeMode="cover" />
      )}
      <View style={{ flexDirection: "row", alignItems: "center", padding: 16 }}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: "700", marginBottom: card.subtitle ? 4 : 0 }}>
            {card.title}
          </Text>
          {!!card.subtitle && (
            <Text style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 19 }}>{card.subtitle}</Text>
          )}
        </View>
        {tappable && (
          <View
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              backgroundColor: colors.accent,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="arrow-forward" size={18} color={colors.accentText} />
          </View>
        )}
      </View>
    </Pressable>
  );
}

// Renders all active promo cards. Returns null when there are none so the Home
// section disappears entirely.
export default function PromoCards({ cards }) {
  if (!cards || cards.length === 0) return null;
  return (
    <View style={{ marginBottom: 8 }}>
      {cards.map((card) => (
        <PromoCard key={card.id} card={card} />
      ))}
    </View>
  );
}
