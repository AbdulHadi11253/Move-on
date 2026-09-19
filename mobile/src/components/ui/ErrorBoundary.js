import { Component } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";

// Catches render/runtime errors anywhere below it and shows the actual error
// message instead of a blank screen. Without this, an uncaught error on Android
// can leave the screen blank with no visible cause. Plain RN primitives + hard-coded
// colors are used on purpose so this still renders even if theming/styling is what broke.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Also print to the Metro terminal for the full stack.
    console.error("ErrorBoundary caught:", error, info?.componentStack);
    this.setState({ info });
  }

  reset = () => this.setState({ error: null, info: null });

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: "#12121C" }}
        contentContainerStyle={{ padding: 24, paddingTop: 80 }}
      >
        <Text style={{ color: "#FF6B6B", fontSize: 20, fontWeight: "700", marginBottom: 12 }}>
          Something crashed
        </Text>
        <Text style={{ color: "#FFFFFF", fontSize: 14, marginBottom: 16 }}>
          {String(this.state.error?.message || this.state.error)}
        </Text>
        {!!this.state.info?.componentStack && (
          <View
            style={{
              backgroundColor: "#1E1E2E",
              borderRadius: 10,
              padding: 12,
              marginBottom: 20,
            }}
          >
            <Text style={{ color: "#9CA3AF", fontSize: 11, fontFamily: "monospace" }}>
              {this.state.info.componentStack.trim()}
            </Text>
          </View>
        )}
        <Pressable
          onPress={this.reset}
          style={{
            backgroundColor: "#6C4FF2",
            borderRadius: 12,
            paddingVertical: 14,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>Try again</Text>
        </Pressable>
      </ScrollView>
    );
  }
}
