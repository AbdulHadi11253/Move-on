import { Text } from "react-native";
import { useTheme } from "../../theme/ThemeContext";

export default function SectionLabel({ children, style }) {
  const { colors } = useTheme();
  return (
    <Text
      style={[
        {
          color: colors.accent,
          fontSize: 11,
          fontWeight: "700",
          letterSpacing: 0.8,
          textTransform: "uppercase",
          marginBottom: 6,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
