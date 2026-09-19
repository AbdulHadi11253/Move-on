import { View, Text, Pressable, ScrollView } from "react-native";
import { useTheme } from "../../theme/ThemeContext";

const COLLECTION_TILE = { id: "collection", name: "My Collection", isCollection: true };

export default function CategoryNameSlider({ categories, onSelect }) {
  const { colors } = useTheme();
  const items = [COLLECTION_TILE, ...(categories || [])];

  return (
    <View style={{ marginBottom: 28 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 8 }}>
        {items.map((cat) => (
          <Pressable
            key={cat.id}
            onPress={() => onSelect(cat)}
            style={({ pressed }) => ({
              borderWidth: 1.5,
              borderColor: cat.isCollection ? colors.accent : colors.border,
              backgroundColor: cat.isCollection ? colors.accentSoft : colors.surface,
              borderRadius: 999,
              paddingHorizontal: 18,
              paddingVertical: 10,
              marginRight: 10,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Text
              style={{
                color: cat.isCollection ? colors.accent : colors.textPrimary,
                fontSize: 14,
                fontWeight: "600",
              }}
            >
              {cat.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
