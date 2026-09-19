import { useState } from "react";
import { View, Text, TextInput, Pressable, FlatList, Modal, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "../../lib/useApi";
import { useTheme } from "../../theme/ThemeContext";
import Screen from "../ui/Screen";
import AdminHeader from "../admin/AdminHeader";

export default function CommentsModal({ post, onClose, refreshKeys = [] }) {
  const { colors } = useTheme();
  const api = useApi();
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const { data: comments, isLoading } = useQuery({
    queryKey: ["quote-post-comments", post?.id],
    queryFn: () => api(`/api/quote-posts/${post.id}/comments`),
    enabled: !!post,
  });

  const send = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      await api(`/api/quote-posts/${post.id}/comments`, { method: "POST", body: { text: text.trim() } });
      setText("");
      queryClient.invalidateQueries({ queryKey: ["quote-post-comments", post.id] });
      refreshKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal visible={!!post} animationType="slide" presentationStyle="pageSheet">
      <Screen>
        <AdminHeader title="Comments" onBack={onClose} />
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          {isLoading ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <ActivityIndicator color={colors.accent} />
            </View>
          ) : (
            <FlatList
              data={comments}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 12, flexGrow: 1 }}
              renderItem={({ item }) => (
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ color: colors.textPrimary, fontSize: 13, fontWeight: "700" }}>
                    {item.user?.name || "Someone"}
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 2 }}>{item.text}</Text>
                </View>
              )}
              ListEmptyComponent={
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ color: colors.textMuted }}>No comments yet. Be the first.</Text>
                </View>
              }
            />
          )}

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderTopWidth: 1,
              borderTopColor: colors.border,
            }}
          >
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Add a comment..."
              placeholderTextColor={colors.textMuted}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.surface,
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 10,
                color: colors.textPrimary,
                marginRight: 10,
              }}
            />
            <Pressable
              onPress={send}
              disabled={sending || !text.trim()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: sending || !text.trim() ? colors.surfaceAlt : colors.accent,
              }}
            >
              <Ionicons name="send" size={16} color={sending || !text.trim() ? colors.textMuted : colors.accentText} />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Screen>
    </Modal>
  );
}
