import { View, Text } from "react-native";
import { useTheme } from "../../theme/ThemeContext";

export default function StatTile({ value, label, style }) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: 18,
          paddingVertical: 16,
          alignItems: "center",
        },
        style,
      ]}
    >
      <Text style={{ color: colors.accent, fontSize: 24, fontWeight: "700" }}>{value}</Text>
      <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>{label}</Text>
    </View>
  );
}
