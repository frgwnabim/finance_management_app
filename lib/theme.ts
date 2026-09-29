export type Theme = "light" | "dark" | "system";

export const THEMES: Theme[] = ["light", "dark", "system"];
export const THEME_STORAGE_KEY = "theme";

const THEME_EVENT = "themechange";
const DARK_QUERY = "(prefers-color-scheme: dark)";

function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark" || value === "system";
}

/**
 * Inline script for <head>. Runs before first paint so the correct theme is
 * applied without a flash, and keeps following the OS while theme is "system".
 * Keep the logic in sync with applyTheme() below.
 */
export const themeScript = `(function(){try{
var k=${JSON.stringify(THEME_STORAGE_KEY)},m=window.matchMedia(${JSON.stringify(DARK_QUERY)});
function a(){var t;try{t=localStorage.getItem(k)}catch(e){}
var d=t==="dark"||(t!=="light"&&m.matches),r=document.documentElement;
r.classList.toggle("dark",d);r.style.colorScheme=d?"dark":"light"}
a();m.addEventListener("change",a);
window.addEventListener("storage",function(e){if(e.key===k)a()});
}catch(e){}})()`;

export function getTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(stored) ? stored : "system";
  } catch {
    return "system";
  }
}

function applyTheme(theme: Theme) {
  const isDark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia(DARK_QUERY).matches);
  const root = document.documentElement;
  root.classList.toggle("dark", isDark);
  root.style.colorScheme = isDark ? "dark" : "light";
}

export function setTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage blocked (e.g. private mode): still apply for this page view.
  }
  applyTheme(theme);
  window.dispatchEvent(new Event(THEME_EVENT));
}

/** Subscribe to theme changes from this tab and other tabs. */
export function subscribeTheme(callback: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === THEME_STORAGE_KEY) callback();
  };
  window.addEventListener(THEME_EVENT, callback);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(THEME_EVENT, callback);
    window.removeEventListener("storage", onStorage);
  };
}
