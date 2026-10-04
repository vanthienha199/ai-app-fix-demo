"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<string | null>(null);
  useEffect(() => setTheme(document.documentElement.dataset.theme ?? "dark"), []);
  function flip() {
    const next = theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch {}
    setTheme(next);
  }
  return (
    <button onClick={flip} aria-label="Switch theme" className="ml-1 grid place-items-center size-9 rounded-[10px] border border-line text-muted hover:text-ink">
      {theme === "light" ? "☾" : "☀"}
    </button>
  );
}
