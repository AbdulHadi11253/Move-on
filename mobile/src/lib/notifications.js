import { Platform } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

const REMINDER_ID = "daily-reminder";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function ensurePermission() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  if (existing.canAskAgain === false) return false;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

// Asks for permission and registers this device's Expo push token with the
// server so admin broadcasts can reach it. Best-effort: never throws.
export async function registerForPush(api) {
  try {
    if (!Device.isDevice) return;
    if (!(await ensurePermission())) return;
    // Remote push isn't supported in Expo Go; local reminders still work there.
    if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) return;
    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    await api("/api/users/push-token", { method: "POST", body: { token, platform: Platform.OS } });
  } catch (e) {
    console.warn("Push registration failed:", e?.message);
  }
}

export async function cancelDailyReminder() {
  try {
    await Notifications.cancelScheduledNotificationAsync(REMINDER_ID);
  } catch {}
}

// Schedules (or reschedules) the repeating local reminder. time is "HH:MM".
export async function scheduleDailyReminder(time = "09:00") {
  try {
    await cancelDailyReminder();
    if (!(await ensurePermission())) return false;
    const [hour, minute] = time.split(":").map(Number);
    await Notifications.scheduleNotificationAsync({
      identifier: REMINDER_ID,
      content: { title: "Move On", body: "Your daily quote and tasks are ready. Take a moment for yourself." },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute },
    });
    return true;
  } catch (e) {
    console.warn("Scheduling reminder failed:", e?.message);
    return false;
  }
}
