"use client";

import { localeLabels, type Locale } from "./i18n-data";
import { useLanguage } from "./LanguageProvider";

const locales: Locale[] = ["ru", "en"];

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <div
      data-i18n-ignore
      className="fixed top-3 right-3 z-[101] flex items-center rounded-full border border-border bg-background/90 p-1 text-xs font-semibold shadow-lg backdrop-blur-md"
      aria-label="Language switcher"
    >
      {locales.map((item) => {
        const isActive = item === locale;
        return (
          <button
            key={item}
            type="button"
            onClick={() => setLocale(item)}
            className={`rounded-full px-2.5 py-1 transition-colors ${
              isActive ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
            }`}
            aria-pressed={isActive}
          >
            {localeLabels[item]}
          </button>
        );
      })}
    </div>
  );
}
