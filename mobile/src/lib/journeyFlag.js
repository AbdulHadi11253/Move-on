import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "move-on/journey-deferred";

export function hasJourneyDeferred() {
  return AsyncStorage.getItem(KEY).then((val) => val === "1");
}

export function markJourneyDeferred() {
  return AsyncStorage.setItem(KEY, "1");
}

export function clearJourneyDeferred() {
  return AsyncStorage.removeItem(KEY);
}
