import { View, Text, Pressable, ScrollView } from "react-native";
import { useTheme } from "../../theme/ThemeContext";

export default function CategoriesRow({ categories, onSelect }) {
  const { colors } = useTheme();

  if (!categories || categories.length === 0) return null;

  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: "700", marginBottom: 12 }}>
        Categories
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {categories.map((cat) => (
          <Pressable
            key={cat.id}
            onPress={() => onSelect(cat)}
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 999,
              paddingHorizontal: 16,
              paddingVertical: 10,
              marginRight: 10,
            }}
          >
            <Text style={{ color: colors.textPrimary, fontSize: 13, fontWeight: "600" }}>{cat.name}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
