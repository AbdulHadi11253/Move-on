import { View } from "react-native";
import { useTheme } from "../../theme/ThemeContext";

export default function Card({ children, style, padded = true }) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: 20,
          padding: padded ? 18 : 0,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
