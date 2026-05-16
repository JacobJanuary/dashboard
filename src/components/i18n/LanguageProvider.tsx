"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { buildTranslationMap, LOCALE_STORAGE_KEY, type Locale } from "./i18n-data";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

const SKIPPED_TEXT_NODE_PARENTS = new Set([
  "SCRIPT",
  "STYLE",
  "NOSCRIPT",
  "SVG",
  "PATH",
  "CODE",
  "PRE",
  "TEXTAREA",
]);

const TRANSLATABLE_ATTRIBUTES = ["placeholder", "aria-label", "title", "alt"];
const TRANSLATABLE_INPUT_TYPES = new Set([
  "",
  "search",
  "text",
]);

function preserveWhitespace(source: string, translated: string) {
  const prefix = source.match(/^\s*/)?.[0] ?? "";
  const suffix = source.match(/\s*$/)?.[0] ?? "";
  return `${prefix}${translated}${suffix}`;
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function shouldSkipElement(element: Element | null) {
  if (!element) return true;
  if (element.closest("[data-i18n-ignore]")) return true;
  return SKIPPED_TEXT_NODE_PARENTS.has(element.tagName);
}

function translateString(
  source: string,
  exactMap: Map<string, string>,
  phraseEntries: Array<[string, string]>,
) {
  const normalized = normalizeText(source);
  if (!normalized) return source;

  const exact = exactMap.get(normalized);
  if (exact) return preserveWhitespace(source, exact);

  let next = source;
  for (const [from, to] of phraseEntries) {
    if (!next.includes(from)) continue;
    next = next.split(from).join(to);
  }

  return next;
}

function translateElementAttributes(
  element: Element,
  exactMap: Map<string, string>,
  phraseEntries: Array<[string, string]>,
) {
  for (const attribute of TRANSLATABLE_ATTRIBUTES) {
    const value = element.getAttribute(attribute);
    if (!value) continue;
    const translated = translateString(value, exactMap, phraseEntries);
    if (translated !== value) element.setAttribute(attribute, translated);
  }

  if (document.activeElement === element) return;

  if (element instanceof HTMLInputElement && TRANSLATABLE_INPUT_TYPES.has(element.type)) {
    const translated = translateString(element.value, exactMap, phraseEntries);
    if (translated !== element.value) {
      element.value = translated;
      element.defaultValue = translated;
    }
  }

  if (element instanceof HTMLTextAreaElement) {
    const translated = translateString(element.value, exactMap, phraseEntries);
    if (translated !== element.value) {
      element.value = translated;
      element.defaultValue = translated;
    }
  }
}

function translateTree(
  root: ParentNode,
  exactMap: Map<string, string>,
  phraseEntries: Array<[string, string]>,
) {
  if (root instanceof Element && root.closest("[data-i18n-ignore]")) return;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  let current: Node | null = walker.currentNode;

  while (current) {
    if (current.nodeType === Node.ELEMENT_NODE) {
      const element = current as Element;
      if (!shouldSkipElement(element)) {
        translateElementAttributes(element, exactMap, phraseEntries);
      }
    }

    if (current.nodeType === Node.TEXT_NODE) {
      const parent = current.parentElement;
      if (!shouldSkipElement(parent)) {
        const source = current.textContent ?? "";
        const translated = translateString(source, exactMap, phraseEntries);
        if (translated !== source) current.textContent = translated;
      }
    }

    current = walker.nextNode();
  }
}

function readInitialLocale(): Locale {
  if (typeof window === "undefined") return "ru";
  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return stored === "en" || stored === "ru" ? stored : "ru";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [locale, setLocaleState] = useState<Locale>("ru");

  useEffect(() => {
    setLocaleState(readInitialLocale());
  }, []);

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
    window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
  }, []);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
    }),
    [locale, setLocale],
  );

  useEffect(() => {
    if (typeof document === "undefined") return;

    const exactMap = buildTranslationMap(locale);
    const phraseEntries = Array.from(exactMap.entries())
      .filter(([from]) => from.length >= 8 || from.includes(" ") || from.endsWith(":") || from.includes("_"))
      .sort(([a], [b]) => b.length - a.length);

    document.documentElement.lang = locale;
    document.documentElement.dataset.locale = locale;

    let animationFrame = 0;
    const runTranslation = () => translateTree(document.body, exactMap, phraseEntries);
    const scheduleTranslation = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(runTranslation);
    };

    runTranslation();

    const observer = new MutationObserver(scheduleTranslation);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: TRANSLATABLE_ATTRIBUTES,
      characterData: true,
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(animationFrame);
    };
  }, [locale, pathname]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
}
