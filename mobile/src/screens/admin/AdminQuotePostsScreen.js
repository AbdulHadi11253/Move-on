import { useState } from "react";
import { View, Text, TextInput, Pressable, Image, Switch, Modal, Alert, ActivityIndicator, FlatList, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "../../lib/useApi";
import { useTheme } from "../../theme/ThemeContext";
import { pickImages as pickImageAssets, uploadImageAsset } from "../../lib/adminImageUpload";
import Screen from "../../components/ui/Screen";
import AdminHeader from "../../components/admin/AdminHeader";
import DeleteButton from "../../components/admin/DeleteButton";
import PillToggle from "../../components/ui/PillToggle";

const emptyForm = { mode: "IMAGE", images: [], text: "", categoryId: null, commentsEnabled: true, isPopular: false, showOnHome: false };

export default function AdminQuotePostsScreen({ navigation }) {
  const api = useApi();
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("ALL");
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null); // { done, total } while uploading

  const { data: posts, isLoading } = useQuery({
    queryKey: ["admin-quote-posts"],
    queryFn: () => api("/api/admin/quote-posts"),
  });
  const { data: categories } = useQuery({
    queryKey: ["admin-quote-categories"],
    queryFn: () => api("/api/admin/quote-categories"),
  });

  const shaped = (posts || []).map((p) => ({ ...p, isCarousel: p.images.length > 1, isText: p.images.length === 0 }));
  const filtered =
    filter === "HOME"
      ? shaped.filter((p) => p.showOnHome).sort((a, b) => a.homeOrder - b.homeOrder)
      : filter === "ALL"
      ? shaped
      : filter === "CAROUSEL"
      ? shaped.filter((p) => p.isCarousel)
      : filter === "TEXT"
      ? shaped.filter((p) => p.isText)
      : shaped.filter((p) => !p.isCarousel && !p.isText);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-quote-posts"] });
    queryClient.invalidateQueries({ queryKey: ["quote-posts"] });
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalVisible(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      mode: item.images.length === 0 ? "TEXT" : "IMAGE",
      images: item.images.map((img) => ({ uri: img.imageUrl, isExisting: true, url: img.imageUrl, path: img.imagePath })),
      text: item.text || "",
      categoryId: item.categoryId,
      commentsEnabled: item.commentsEnabled,
      isPopular: item.isPopular,
      showOnHome: item.showOnHome,
    });
    setModalVisible(true);
  };

  const pickImages = async () => {
    try {
      const assets = await pickImageAssets({ allowsMultipleSelection: true, selectionLimit: 20 });
      if (assets.length) {
        const picked = assets.map((a) => ({ ...a, isExisting: false }));
        setForm((f) => ({ ...f, images: [...f.images, ...picked] }));
      }
    } catch (e) {
      Alert.alert("Permission needed", e.message);
    }
  };

  const removeImage = (index) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }));
  };

  const save = async () => {
    if (form.mode === "TEXT" && !form.text.trim()) {
      Alert.alert("Text required", "Write the quote text for this post.");
      return;
    }
    if (form.mode === "IMAGE" && form.images.length === 0) {
      Alert.alert("Images required", "Pick at least one image for this quote.");
      return;
    }
    setSaving(true);
    try {
      let finalImages = [];
      if (form.mode === "IMAGE") {
        const existingImages = form.images.filter((i) => i.isExisting).map((i) => ({ url: i.url, path: i.path }));
        const newImages = form.images.filter((i) => !i.isExisting);

        // One request per image, not one batched request for all of them —
        // Vercel's Serverless Functions hard-cap the request body at 4.5MB, so
        // a multi-image carousel batched into a single request would eventually
        // 413 no matter what our own server allows. uploadImageAsset also
        // resizes/compresses each image first, keeping every request small.
        const uploadedImages = [];
        setUploadProgress({ done: 0, total: newImages.length });
        for (const img of newImages) {
          const uploaded = await uploadImageAsset(api, img.uri, "quotes");
          uploadedImages.push(uploaded);
          setUploadProgress((p) => ({ done: p.done + 1, total: p.total }));
        }
        setUploadProgress(null);

        finalImages = [...existingImages, ...uploadedImages];
      }

      const body = {
        images: finalImages,
        text: form.mode === "TEXT" ? form.text.trim() : "",
        categoryId: form.categoryId,
        commentsEnabled: form.commentsEnabled,
        isPopular: form.isPopular,
        showOnHome: form.showOnHome,
      };

      if (editing) {
        await api(`/api/admin/quote-posts/${editing.id}`, { method: "PATCH", body });
      } else {
        await api("/api/admin/quote-posts", { method: "POST", body });
      }
      setModalVisible(false);
      refresh();
    } catch (e) {
      Alert.alert("Couldn't save", e.message);
    } finally {
      setSaving(false);
      setUploadProgress(null);
    }
  };

  const remove = (item) => {
    Alert.alert("Delete quote", "This removes all images in this post and can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api(`/api/admin/quote-posts/${item.id}`, { method: "DELETE" });
            setModalVisible(false);
            refresh();
          } catch (e) {
            Alert.alert("Couldn't delete", e.message);
          }
        },
      },
    ]);
  };

  const move = async (item, direction) => {
    const field = filter === "HOME" ? "homeOrder" : "order";
    await api(`/api/admin/quote-posts/${item.id}/reorder`, { method: "POST", body: { direction, field } });
    refresh();
  };

  return (
    <Screen>
      <AdminHeader title="Quotes" onBack={() => navigation.goBack()} rightLabel="+" onRightPress={openCreate} />

      <View style={{ paddingHorizontal: 24, marginBottom: 12 }}>
        <PillToggle
          options={[
            { value: "ALL", label: "All" },
            { value: "CAROUSEL", label: "Carousels" },
            { value: "SINGLE", label: "Single Posts" },
            { value: "TEXT", label: "Text" },
            { value: "HOME", label: "Home" },
          ]}
          value={filter}
          onChange={setFilter}
        />
        {filter === "HOME" && (
          <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 8 }}>
            Use the arrows to set the order these appear on Home.
          </Text>
        )}
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
          renderItem={({ item }) => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
                paddingVertical: 12,
              }}
            >
              <Pressable onPress={() => openEdit(item)} style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                <View>
                  {item.isText ? (
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 10,
                        marginRight: 12,
                        backgroundColor: colors.accentSoft,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Ionicons name="text" size={22} color={colors.accent} />
                    </View>
                  ) : (
                    <Image source={{ uri: item.images[0]?.imageUrl }} style={{ width: 48, height: 48, borderRadius: 10, marginRight: 12 }} />
                  )}
                  {item.isCarousel && (
                    <View
                      style={{
                        position: "absolute",
                        bottom: -2,
                        right: 10,
                        backgroundColor: colors.accent,
                        borderRadius: 8,
                        paddingHorizontal: 5,
                        paddingVertical: 1,
                      }}
                    >
                      <Text style={{ color: colors.accentText, fontSize: 10, fontWeight: "700" }}>{item.images.length}</Text>
                    </View>
                  )}
                  {item.isPopular && (
                    <View
                      style={{
                        position: "absolute",
                        top: -4,
                        left: -4,
                        backgroundColor: colors.background,
                        borderRadius: 9,
                      }}
                    >
                      <Ionicons name="star" size={16} color="#F5A623" />
                    </View>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: "500" }} numberOfLines={1}>
                    {item.isText ? item.text : item.isCarousel ? `Carousel · ${item.images.length} slides` : "Single Post"}
                    {item.category ? ` · ${item.category.name}` : ""}
                  </Text>
                  <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
                    {item.commentCount || 0} comments · {item.commentsEnabled ? "Comments on" : "Comments off"}
                    {item.isPopular ? " · Popular" : ""}
                    {item.showOnHome ? " · On Home" : ""}
                  </Text>
                </View>
              </Pressable>

              <Pressable onPress={() => move(item, "up")} hitSlop={8} style={{ padding: 6 }}>
                <Ionicons name="chevron-up" size={18} color={colors.textSecondary} />
              </Pressable>
              <Pressable onPress={() => move(item, "down")} hitSlop={8} style={{ padding: 6 }}>
                <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
              </Pressable>
              <Pressable onPress={() => remove(item)} hitSlop={8} style={{ padding: 8 }}>
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
              </Pressable>
            </View>
          )}
          ListEmptyComponent={
            <Text style={{ color: colors.textMuted, textAlign: "center", marginTop: 40 }}>
              No quotes yet. Tap + to add one — pick multiple images to create a carousel.
            </Text>
          }
        />
      )}

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <Screen>
          <AdminHeader title={editing ? "Edit Quote" : "New Quote"} onBack={() => setModalVisible(false)} />
          <FlatList
            data={[]}
            renderItem={null}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 20 }}
            ListHeaderComponent={
              <>
                <View style={{ flexDirection: "row", marginBottom: 20 }}>
                  {[{ key: "IMAGE", label: "Image post" }, { key: "TEXT", label: "Text post" }].map((m) => {
                    const active = form.mode === m.key;
                    return (
                      <Pressable
                        key={m.key}
                        onPress={() => setForm((f) => ({ ...f, mode: m.key }))}
                        style={{
                          flex: 1,
                          marginRight: m.key === "IMAGE" ? 8 : 0,
                          borderRadius: 12,
                          paddingVertical: 12,
                          alignItems: "center",
                          backgroundColor: active ? colors.accent : colors.surfaceAlt,
                        }}
                      >
                        <Text style={{ color: active ? colors.accentText : colors.textSecondary, fontSize: 14, fontWeight: "700" }}>
                          {m.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {form.mode === "TEXT" ? (
                  <>
                    <Text
                      style={{
                        color: colors.textMuted,
                        fontSize: 11,
                        fontWeight: "700",
                        letterSpacing: 0.6,
                        textTransform: "uppercase",
                        marginBottom: 8,
                      }}
                    >
                      Quote Text
                    </Text>
                    <TextInput
                      value={form.text}
                      onChangeText={(t) => setForm((f) => ({ ...f, text: t }))}
                      placeholder="Write the quote..."
                      placeholderTextColor={colors.textMuted}
                      multiline
                      style={{
                        borderWidth: 1,
                        borderColor: colors.border,
                        borderRadius: 14,
                        padding: 14,
                        minHeight: 100,
                        textAlignVertical: "top",
                        color: colors.textPrimary,
                        fontSize: 15,
                        marginBottom: 20,
                      }}
                    />
                  </>
                ) : (
                  <>
                    <Text
                      style={{
                        color: colors.textMuted,
                        fontSize: 11,
                        fontWeight: "700",
                        letterSpacing: 0.6,
                        textTransform: "uppercase",
                        marginBottom: 8,
                      }}
                    >
                      Images {form.images.length > 1 ? `(${form.images.length} — Carousel)` : form.images.length === 1 ? "(1 — Single Post)" : ""}
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                      {form.images.map((img, i) => (
                        <View key={i} style={{ marginRight: 10 }}>
                          <Image source={{ uri: img.uri }} style={{ width: 90, height: 90, borderRadius: 12 }} />
                          <Pressable
                            onPress={() => removeImage(i)}
                            style={{ position: "absolute", top: -6, right: -6, backgroundColor: colors.background, borderRadius: 11 }}
                          >
                            <Ionicons name="close-circle" size={22} color={colors.danger} />
                          </Pressable>
                        </View>
                      ))}
                      <Pressable
                        onPress={pickImages}
                        style={{
                          width: 90,
                          height: 90,
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: colors.border,
                          backgroundColor: colors.surfaceAlt,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Ionicons name="add" size={26} color={colors.accent} />
                        <Text style={{ color: colors.accent, fontSize: 11, fontWeight: "600", marginTop: 2 }}>Add</Text>
                      </Pressable>
                    </ScrollView>
                    <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 20 }}>
                      Pick one image for a single post, or multiple for a swipeable carousel.
                    </Text>
                  </>
                )}

                <Text
                  style={{
                    color: colors.textMuted,
                    fontSize: 11,
                    fontWeight: "700",
                    letterSpacing: 0.6,
                    textTransform: "uppercase",
                    marginBottom: 8,
                  }}
                >
                  Category
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 20, marginHorizontal: -4 }}>
                  {[{ id: null, name: "None" }, ...(categories || [])].map((cat) => {
                    const active = form.categoryId === cat.id;
                    return (
                      <View key={cat.id || "none"} style={{ padding: 4 }}>
                        <Pressable
                          onPress={() => setForm({ ...form, categoryId: cat.id })}
                          style={{
                            borderWidth: active ? 0 : 1,
                            borderColor: colors.border,
                            backgroundColor: active ? colors.accent : "transparent",
                            borderRadius: 999,
                            paddingHorizontal: 14,
                            paddingVertical: 8,
                          }}
                        >
                          <Text style={{ color: active ? colors.accentText : colors.textSecondary, fontWeight: "600", fontSize: 13 }}>
                            {cat.name}
                          </Text>
                        </Pressable>
                      </View>
                    );
                  })}
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 16,
                  }}
                >
                  <Text style={{ color: colors.textPrimary, fontSize: 15 }}>Allow comments</Text>
                  <Switch
                    value={form.commentsEnabled}
                    onValueChange={(v) => setForm({ ...form, commentsEnabled: v })}
                    trackColor={{ false: colors.surfaceAlt, true: colors.accent }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 20,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons name="star" size={16} color="#F5A623" style={{ marginRight: 6 }} />
                    <Text style={{ color: colors.textPrimary, fontSize: 15 }}>Most Popular</Text>
                  </View>
                  <Switch
                    value={form.isPopular}
                    onValueChange={(v) => setForm({ ...form, isPopular: v })}
                    trackColor={{ false: colors.surfaceAlt, true: colors.accent }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 20,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons name="home" size={16} color={colors.accent} style={{ marginRight: 6 }} />
                    <Text style={{ color: colors.textPrimary, fontSize: 15 }}>Show on Home</Text>
                  </View>
                  <Switch
                    value={form.showOnHome}
                    onValueChange={(v) => setForm({ ...form, showOnHome: v })}
                    trackColor={{ false: colors.surfaceAlt, true: colors.accent }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                <Pressable
                  onPress={save}
                  disabled={saving}
                  style={{
                    borderRadius: 16,
                    paddingVertical: 16,
                    alignItems: "center",
                    marginTop: 8,
                    backgroundColor: saving ? colors.surfaceAlt : colors.accent,
                  }}
                >
                  <Text style={{ color: saving ? colors.textMuted : colors.accentText, fontWeight: "600" }}>
                    {uploadProgress ? `Uploading ${uploadProgress.done}/${uploadProgress.total}...` : saving ? "Saving..." : "Save"}
                  </Text>
                </Pressable>

                {editing && <DeleteButton onPress={() => remove(editing)} />}
              </>
            }
          />
        </Screen>
      </Modal>
    </Screen>
  );
}
