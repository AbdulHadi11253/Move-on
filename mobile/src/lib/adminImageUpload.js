import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";

// Picks one image and uploads it via the given api() call, returning its
// public URL. Reads the file as base64 rather than using fetch(uri).blob() —
// see routes/admin/quote-posts/upload.js for why that path is unreliable on
// this RN/SDK combination. Returns null if the user cancels picking.
export async function pickAndUploadImage(api, endpoint = "/api/admin/upload-image") {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) throw new Error("Allow photo library access to pick an image.");

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.85,
  });
  if (result.canceled || !result.assets?.length) return null;

  const asset = result.assets[0];
  const mimeType = asset.mimeType || "image/jpeg";
  const base64 = await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.Base64 });
  const uploaded = await api(endpoint, { method: "POST", body: { base64, mimeType } });
  return uploaded.url;
}
