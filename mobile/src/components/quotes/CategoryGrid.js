import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeContext";

const ICON_BY_KEYWORD = [
  [["breakup", "break up"], "heart-dislike-outline"],
  [["self love", "self-love", "self worth", "self-worth"], "flower-outline"],
  [["motivat"], "flash-outline"],
  [["heal"], "bandage-outline"],
  [["toxic"], "alert-circle-outline"],
  [["confidence"], "sunny-outline"],
  [["boundar"], "shield-checkmark-outline"],
  [["overthink", "anxiety", "anxious"], "cloud-outline"],
  [["gratitude", "grateful"], "sparkles-outline"],
  [["growth", "discipline"], "trending-up-outline"],
  [["loneliness", "alone"], "moon-outline"],
  [["mov"], "leaf-outline"],
  [["empower"], "leaf-outline"],
];

const TILE_COLORS = [
  { bg: "#F4C7D8", icon: "#8C3A57" },
  { bg: "#F5D9A8", icon: "#8A5A1F" },
  { bg: "#BFD8F6", icon: "#2C5590" },
  { bg: "#C6E7CE", icon: "#2F6B45" },
  { bg: "#DCC9F5", icon: "#5B3E8E" },
  { bg: "#F6D3C2", icon: "#8A4B27" },
];

const COLUMNS = 4;

function iconForCategory(name = "") {
  const lower = name.toLowerCase();
  for (const [keywords, icon] of ICON_BY_KEYWORD) {
    if (keywords.some((k) => lower.includes(k))) return icon;
  }
  return "sparkles-outline";
}

const COLLECTION_TILE = { id: "collection", name: "My Collection", isCollection: true };

export default function CategoryGrid({ categories, onSelect, showTitle = true }) {
  const { colors } = useTheme();

  const items = [COLLECTION_TILE, ...(categories || [])];

  return (
    <View style={{ marginBottom: 28 }}>
      {showTitle && (
        <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: "700", marginBottom: 16 }}>
          Categories
        </Text>
      )}
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {items.map((cat, i) => {
          const tile = cat.isCollection
            ? { bg: colors.accentSoft, icon: colors.accent }
            : TILE_COLORS[(i - 1) % TILE_COLORS.length];
          return (
            <View key={cat.id} style={{ width: `${100 / COLUMNS}%`, alignItems: "center", marginBottom: 20 }}>
              <Pressable
                onPress={() => onSelect(cat)}
                style={({ pressed }) => ({ alignItems: "center", opacity: pressed ? 0.7 : 1 })}
              >
                <View
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: 18,
                    backgroundColor: tile.bg,
                    borderWidth: cat.isCollection ? 1.5 : 0,
                    borderColor: colors.accent,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                    shadowColor: "#000",
                    shadowOpacity: 0.1,
                    shadowRadius: 6,
                    shadowOffset: { width: 0, height: 3 },
                    elevation: 2,
                  }}
                >
                  <Ionicons
                    name={cat.isCollection ? "bookmark" : iconForCategory(cat.name)}
                    size={26}
                    color={tile.icon}
                  />
                </View>
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: 12,
                    fontWeight: "600",
                    textAlign: "center",
                    paddingHorizontal: 4,
                  }}
                  numberOfLines={2}
                >
                  {cat.name}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}
