import { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { THEMES, DEFAULT_THEME_KEY } from "./themes";

const STORAGE_KEY = "move-on/theme";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeKey, setThemeKey] = useState(DEFAULT_THEME_KEY);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved && THEMES[saved]) setThemeKey(saved);
    });
  }, []);

  const setTheme = (key) => {
    if (!THEMES[key]) return;
    setThemeKey(key);
    AsyncStorage.setItem(STORAGE_KEY, key);
  };

  const value = useMemo(
    () => ({
      themeKey,
      theme: THEMES[themeKey],
      colors: THEMES[themeKey].colors,
      setTheme,
      themes: Object.values(THEMES),
    }),
    [themeKey]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
