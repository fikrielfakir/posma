import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { type Language, type Currency, translations, languages } from "@/lib/i18n";

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  currency: Currency;
  setCurrency: (curr: Currency) => void;
  warehouseId: string | null;
  setWarehouseId: (id: string | null) => void;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved as Language) || "fr";
  });
  
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = localStorage.getItem("currency");
    return (saved as Currency) || "MAD";
  });
  
  const [warehouseId, setWarehouseIdState] = useState<string | null>(() => {
    return localStorage.getItem("warehouseId");
  });
  
  const [theme, setThemeState] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved as "light" | "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const setCurrency = (curr: Currency) => {
    setCurrencyState(curr);
    localStorage.setItem("currency", curr);
  };

  const setWarehouseId = (id: string | null) => {
    setWarehouseIdState(id);
    if (id) {
      localStorage.setItem("warehouseId", id);
    } else {
      localStorage.removeItem("warehouseId");
    }
  };

  const setTheme = (newTheme: "light" | "dark") => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.dir = languages[language].dir;
    document.documentElement.lang = language === "darija" ? "ar" : language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const dir = languages[language].dir;

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        currency,
        setCurrency,
        warehouseId,
        setWarehouseId,
        theme,
        setTheme,
        toggleTheme,
        t,
        dir,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
