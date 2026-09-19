import AsyncStorage from "@react-native-async-storage/async-storage";

function todayKey() {
  return `move-on/recovery-started/${new Date().toISOString().slice(0, 10)}`;
}

export function hasStartedToday() {
  return AsyncStorage.getItem(todayKey()).then((val) => val === "1");
}

export function markStartedToday() {
  return AsyncStorage.setItem(todayKey(), "1");
}

export function clearStartedToday() {
  return AsyncStorage.removeItem(todayKey());
}
