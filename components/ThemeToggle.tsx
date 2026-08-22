import { useEffect, useState } from "react";

type ThemeMode = "light" | "dark" | "system";

export default function ThemeToggle() {
  const [mode, setMode] =
    useState<ThemeMode>("system");

  useEffect(() => {
    const saved =
      (localStorage.getItem("rsre-theme") as ThemeMode) ||
      "system";

    setMode(saved);

    const apply = (value: ThemeMode) => {
      const dark =
        value === "dark" ||
        (
          value === "system" &&
          window.matchMedia(
            "(prefers-color-scheme: dark)"
          ).matches
        );

      document.documentElement.classList.toggle(
        "dark",
        dark
      );

      document.documentElement.dataset.theme =
        dark ? "dark" : "light";

      document.documentElement.style.colorScheme =
        dark ? "dark" : "light";
    };

    apply(saved);
  }, []);

  function changeTheme(value: ThemeMode) {
    setMode(value);
    localStorage.setItem(
      "rsre-theme",
      value
    );

    const dark =
      value === "dark" ||
      (
        value === "system" &&
        window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches
      );

    document.documentElement.classList.toggle(
      "dark",
      dark
    );

    document.documentElement.dataset.theme =
      dark ? "dark" : "light";

    document.documentElement.style.colorScheme =
      dark ? "dark" : "light";
  }

  return (
    <div
      className="inline-flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900"
      aria-label="Theme"
    >
      {(
        [
          ["light", "Light"],
          ["system", "System"],
          ["dark", "Dark"],
        ] as const
      ).map(([value, label]) => (
        <button
          key={value}
          type="button"
          onClick={() => changeTheme(value)}
          className={
            mode === value
              ? "rounded-lg bg-slate-950 px-2.5 py-1.5 text-[11px] font-black text-white dark:bg-white dark:text-slate-950"
              : "rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          }
        >
          {label}
        </button>
      ))}
    </div>
  );
}
