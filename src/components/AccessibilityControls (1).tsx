import { useEffect, useState } from "react";

const FONT_SIZES = [100, 115, 130];

export default function AccessibilityControls() {
  const [open, setOpen] = useState(false);
  const [fontSize, setFontSize] = useState(() => {
    const saved = Number(localStorage.getItem("a11y-font-size"));
    return FONT_SIZES.includes(saved) ? saved : 100;
  });
  const [highContrast, setHighContrast] = useState(
    () => localStorage.getItem("a11y-high-contrast") === "true"
  );

  useEffect(() => {
    const applySettings = () => {
      const root = document.documentElement;
      root.style.fontSize = `${fontSize}%`;
      root.classList.toggle("a11y-high-contrast", highContrast);

      if (highContrast) {
        root.classList.remove("dark");
        root.classList.add("light");
      } else {
        const savedTheme = localStorage.getItem("theme") === "light" ? "light" : "dark";
        root.classList.remove("dark", "light");
        root.classList.add(savedTheme);
      }
    };

    applySettings();
    const timer = window.setTimeout(applySettings, 0);
    localStorage.setItem("a11y-font-size", String(fontSize));
    localStorage.setItem("a11y-high-contrast", String(highContrast));

    return () => window.clearTimeout(timer);
  }, [fontSize, highContrast]);

  const changeFontSize = (direction: number) => {
    const currentIndex = FONT_SIZES.indexOf(fontSize);
    const nextIndex = Math.min(
      FONT_SIZES.length - 1,
      Math.max(0, currentIndex + direction)
    );
    setFontSize(FONT_SIZES[nextIndex]);
  };

  const resetSettings = () => {
    setFontSize(100);
    setHighContrast(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="rounded-xl p-2 text-sm font-bold text-[#735A45] hover:bg-[#8E6D4E]/10 dark:text-white"
        aria-label="เปิดเมนูช่วยการเข้าถึง"
        aria-expanded={open}
        title="ปรับขนาดตัวอักษรและสีคอนทราสต์"
      >
        ♿ Aa
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border border-[#8E6D4E]/20 bg-white p-4 text-[#4E3B2C] shadow-2xl dark:bg-[#1E1A16] dark:text-white">
          <p className="mb-3 text-sm font-bold">การช่วยการเข้าถึง</p>

          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs">ขนาดตัวอักษร {fontSize}%</span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => changeFontSize(-1)}
                disabled={fontSize === 100}
                className="rounded-lg border px-3 py-2 font-bold disabled:opacity-40"
              >
                A−
              </button>
              <button
                type="button"
                onClick={() => setFontSize(100)}
                className="rounded-lg border px-3 py-2 font-bold"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => changeFontSize(1)}
                disabled={fontSize === 130}
                className="rounded-lg border px-3 py-2 font-bold disabled:opacity-40"
              >
                A+
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setHighContrast(!highContrast)}
            className="mb-2 w-full rounded-xl border border-[#8E6D4E]/30 px-3 py-2.5 text-xs font-bold"
            aria-pressed={highContrast}
          >
            ◐ คอนทราสต์สูงพื้นสว่าง: {highContrast ? "เปิด" : "ปิด"}
          </button>

          <button
            type="button"
            onClick={resetSettings}
            className="w-full rounded-xl px-3 py-2 text-xs text-stone-500 hover:bg-stone-100 dark:text-stone-300"
          >
            ↻ คืนค่าเดิม
          </button>
        </div>
      )}

      <style>{`
        html.a11y-high-contrast {
          color-scheme: light;
        }
        html.a11y-high-contrast body {
          background-color: #ffffff !important;
        }
        html.a11y-high-contrast #root {
          filter: contrast(1.3) saturate(0.9);
        }
        html.a11y-high-contrast body a {
          color: #003b8f !important;
          text-decoration: underline !important;
          text-decoration-thickness: 2px !important;
          font-weight: 700 !important;
        }
        html.a11y-high-contrast body :where(button, input, textarea, select) {
          background-color: #ffffff !important;
          color: #111111 !important;
          border-color: #111111 !important;
          border-width: 2px !important;
          font-weight: 700 !important;
        }
        html.a11y-high-contrast body button * {
          color: inherit !important;
        }
        html.a11y-high-contrast body :where(button, a, input, textarea, select):focus-visible {
          outline: 4px solid #005fcc !important;
          outline-offset: 3px !important;
        }
      `}</style>
    </div>
  );
}
