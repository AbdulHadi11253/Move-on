import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";

// Vercel Serverless Functions hard-cap the request body at 4.5MB no matter
// what our own server allows — a raw phone-camera photo can easily exceed
// that once base64-encoded (~33% larger). Resizing down before upload keeps
// every image comfortably under that limit and off the retry-a-huge-payload
// treadmill entirely. Output is always JPEG — smaller than PNG for photos
// and one predictable mimeType to deal with.
async function resizeForUpload(uri) {
  const result = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: 1600 } }], {
    compress: 0.7,
    format: ImageManipulator.SaveFormat.JPEG,
  });
  return result.uri;
}

// Uploads one already-picked image and returns { url, path }.
export async function uploadImageAsset(api, uri, folder = "notifications") {
  const resizedUri = await resizeForUpload(uri);
  const base64 = await FileSystem.readAsStringAsync(resizedUri, { encoding: FileSystem.EncodingType.Base64 });
  return api("/api/admin/upload-image", { method: "POST", body: { base64, mimeType: "image/jpeg", folder } });
}

// Picks one image, uploads it, and returns its public URL. Returns null if
// the user cancels picking.
export async function pickAndUploadImage(api, folder = "notifications") {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) throw new Error("Allow photo library access to pick an image.");

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.85,
  });
  if (result.canceled || !result.assets?.length) return null;

  const uploaded = await uploadImageAsset(api, result.assets[0].uri, folder);
  return uploaded.url;
}

// Picks one or more images without uploading them — the caller uploads each
// (via uploadImageAsset) itself, e.g. to show per-image progress.
export async function pickImages({ allowsMultipleSelection = false, selectionLimit = 1 } = {}) {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) throw new Error("Allow photo library access to pick images.");

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.85,
    allowsMultipleSelection,
    selectionLimit,
  });
  if (result.canceled || !result.assets?.length) return [];
  return result.assets;
}
