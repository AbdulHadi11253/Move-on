import { RefreshControl } from "react-native";
import { useTheme } from "../../theme/ThemeContext";

// IMPORTANT: On Android, ScrollView/FlatList clones the `refreshControl` element
// and passes the entire scroll content as its children. The real RefreshControl
// renders those children — so this wrapper MUST forward `children` (and any props
// RN injects) to RefreshControl. Dropping children makes all scroll content vanish
// on Android while iOS (which nests content differently) still works.
export default function ThemedRefreshControl({ refreshing, onRefresh, children, ...rest }) {
  const { colors } = useTheme();
  return (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={colors.accent}
      colors={[colors.accent]}
      progressBackgroundColor={colors.surface}
      titleColor={colors.textSecondary}
      {...rest}
    >
      {children}
    </RefreshControl>
  );
}
