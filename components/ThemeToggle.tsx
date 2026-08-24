import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

type ThemeMode = "light" | "dark" | "system";

export default function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>("system");

  useEffect(() => {
    const saved =
      (localStorage.getItem("rsre-theme") as ThemeMode) || "system";

    setMode(saved);
    applyTheme(saved);
  }, []);

  function applyTheme(value: ThemeMode) {
    const dark =
      value === "dark" ||
      (value === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
  }

  function changeTheme(value: ThemeMode) {
    setMode(value);
    localStorage.setItem("rsre-theme", value);
    applyTheme(value);
  }

  const items = [
    ["light", "Light", Sun],
    ["system", "System", Monitor],
    ["dark", "Dark", Moon],
  ] as const;

  return (
    <div
      className="inline-flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900"
      aria-label="Theme"
    >
      {items.map(([value, label, Icon]) => (
        <button
          key={value}
          type="button"
          onClick={() => changeTheme(value)}
          title={label}
          aria-label={label}
          className={`grid h-8 w-8 place-items-center rounded-lg transition ${
            mode === value
              ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
              : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          }`}
        >
          <Icon size={15} />
        </button>
      ))}
    </div>
  );
}
