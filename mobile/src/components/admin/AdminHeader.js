import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeContext";

export default function AdminHeader({ title, onBack, rightLabel, onRightPress }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 24,
        paddingTop: 8,
        paddingBottom: 16,
      }}
    >
      <Pressable onPress={onBack} hitSlop={12} style={{ width: 32 }}>
        {onBack && <Ionicons name="chevron-back" size={24} color={colors.textSecondary} />}
      </Pressable>
      <Text style={{ color: colors.textPrimary, fontSize: 17, fontWeight: "600" }}>{title}</Text>
      <Pressable onPress={onRightPress} hitSlop={12} style={{ width: 32, alignItems: "flex-end" }}>
        {rightLabel && (
          <View
            style={{
              width: 30,
              height: 30,
              borderRadius: 15,
              backgroundColor: colors.accentSoft,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: colors.accent, fontSize: 18, fontWeight: "700", lineHeight: 20 }}>
              {rightLabel}
            </Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}
