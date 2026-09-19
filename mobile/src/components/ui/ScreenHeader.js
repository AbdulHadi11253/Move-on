import { View, Text, Pressable } from "react-native";
import { useTheme } from "../../theme/ThemeContext";

export default function ScreenHeader({ title, onBack, right }) {
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
      <Pressable onPress={onBack} hitSlop={12} style={{ width: 28 }}>
        {onBack && <Text style={{ color: colors.textSecondary, fontSize: 26 }}>‹</Text>}
      </Pressable>
      <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "600" }}>{title}</Text>
      <View style={{ width: 28, alignItems: "flex-end" }}>{right}</View>
    </View>
  );
}
