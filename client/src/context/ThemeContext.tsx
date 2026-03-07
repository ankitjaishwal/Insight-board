import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ThemeMode = "light" | "dark";
type StoredThemePreference = ThemeMode | "system";

type ThemeContextValue = {
  currentTheme: ThemeMode;
  toggleTheme: () => void;
};

const STORAGE_KEY = "insight-board-theme";

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: ThemeMode) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState<StoredThemePreference>(() => {
    if (typeof window === "undefined") {
      return "system";
    }

    const stored = window.localStorage.getItem(
      STORAGE_KEY,
    ) as StoredThemePreference | null;

    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }

    return "system";
  });
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>(() =>
    preference === "system" ? getSystemTheme() : preference,
  );

  useEffect(() => {
    const resolvedTheme =
      preference === "system" ? getSystemTheme() : preference;
    setCurrentTheme(resolvedTheme);
    applyTheme(resolvedTheme);
    window.localStorage.setItem(STORAGE_KEY, preference);
  }, [preference]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      if (preference === "system") {
        const nextTheme = mediaQuery.matches ? "dark" : "light";
        setCurrentTheme(nextTheme);
        applyTheme(nextTheme);
      }
    };

    handleChange();
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [preference]);

  const value = useMemo(
    () => ({
      currentTheme,
      toggleTheme: () => {
        setPreference((prev) => {
          const resolvedTheme = prev === "system" ? getSystemTheme() : prev;
          return resolvedTheme === "dark" ? "light" : "dark";
        });
      },
    }),
    [currentTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
