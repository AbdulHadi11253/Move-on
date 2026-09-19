import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeContext";

export default function AdminListRow({ title, subtitle, onPress, onDelete, right, numberOfLinesTitle = 1 }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <Pressable onPress={onPress} style={{ flex: 1, paddingVertical: 14, paddingRight: 12 }}>
        <Text style={{ color: colors.textPrimary, fontSize: 15 }} numberOfLines={numberOfLinesTitle}>
          {title}
        </Text>
        {!!subtitle && <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 4 }}>{subtitle}</Text>}
      </Pressable>
      {right}
      {onDelete && (
        <Pressable onPress={onDelete} hitSlop={10} style={{ padding: 8 }}>
          <Ionicons name="trash-outline" size={18} color={colors.danger} />
        </Pressable>
      )}
    </View>
  );
}
