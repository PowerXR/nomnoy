import { useEffect, useState } from "react";

// กำหนดระดับขนาดตัวอักษรที่ผู้ใช้สามารถเลือกได้
// ค่าเป็นเปอร์เซ็นต์: ปกติ 100%, ใหญ่ 115% และใหญ่มาก 130%
const FONT_SIZES = [100, 115, 130];

export default function AccessibilityControls() {
  // เก็บสถานะการเปิด–ปิดเมนูช่วยการเข้าถึง
  const [open, setOpen] = useState(false);

  // เก็บขนาดตัวอักษรที่เลือกไว้
  // เมื่อเปิดหน้าเว็บ จะอ่านค่าที่เคยบันทึกจาก localStorage
  // หากไม่พบค่าหรือค่าไม่ถูกต้อง จะใช้ขนาดปกติ 100%
  const [fontSize, setFontSize] = useState(() => {
    const saved = Number(localStorage.getItem("a11y-font-size"));
    return FONT_SIZES.includes(saved) ? saved : 100;
  });

  // เก็บสถานะโหมดคอนทราสต์สูง
  // อ่านค่าที่ผู้ใช้เคยเลือกไว้จาก localStorage
  const [highContrast, setHighContrast] = useState(
    () => localStorage.getItem("a11y-high-contrast") === "true"
  );

  // ทำงานทุกครั้งเมื่อขนาดตัวอักษรหรือโหมดคอนทราสต์สูงเปลี่ยนแปลง
  useEffect(() => {
    // ฟังก์ชันสำหรับนำค่าการช่วยการเข้าถึงไปใช้กับหน้าเว็บไซต์
    const applySettings = () => {
      // อ้างอิงแท็ก <html> ของหน้าเว็บไซต์
      const root = document.documentElement;

      // เปลี่ยนขนาดตัวอักษรของเว็บไซต์ตามค่าที่ผู้ใช้เลือก
      root.style.fontSize = `${fontSize}%`;

      // เพิ่มหรือลบคลาส a11y-high-contrast ตามสถานะคอนทราสต์สูง
      root.classList.toggle("a11y-high-contrast", highContrast);

      // หากเปิดคอนทราสต์สูง จะบังคับให้เว็บไซต์ใช้ธีมสว่าง
      if (highContrast) {
        root.classList.remove("dark");
        root.classList.add("light");
      } else {
        // หากปิดคอนทราสต์สูง จะกลับไปใช้ธีมเดิมที่บันทึกไว้
        const savedTheme =
          localStorage.getItem("theme") === "light" ? "light" : "dark";

        root.classList.remove("dark", "light");
        root.classList.add(savedTheme);
      }
    };

    // ใช้การตั้งค่าทันที
    applySettings();

    // เรียกใช้ซ้ำหลังจากเบราว์เซอร์ประมวลผลรอบปัจจุบันเสร็จ
    // ช่วยให้การตั้งค่าถูกนำไปใช้ครบถ้วน
    const timer = window.setTimeout(applySettings, 0);

    // บันทึกขนาดตัวอักษรและสถานะคอนทราสต์สูงไว้ในเบราว์เซอร์
    // เมื่อกลับมาเปิดเว็บไซต์ใหม่ ค่าที่เลือกไว้จะยังคงอยู่
    localStorage.setItem("a11y-font-size", String(fontSize));
    localStorage.setItem("a11y-high-contrast", String(highContrast));

    // ยกเลิก timer เมื่อคอมโพเนนต์ถูกปิดหรือก่อน useEffect ทำงานรอบใหม่
    return () => window.clearTimeout(timer);
  }, [fontSize, highContrast]);

  // ฟังก์ชันเพิ่มหรือลดขนาดตัวอักษร
  // direction = -1 หมายถึงลดขนาด
  // direction = 1 หมายถึงเพิ่มขนาด
  const changeFontSize = (direction: number) => {
    // หาตำแหน่งของขนาดตัวอักษรปัจจุบันในอาร์เรย์ FONT_SIZES
    const currentIndex = FONT_SIZES.indexOf(fontSize);

    // คำนวณตำแหน่งใหม่ โดยไม่ให้ต่ำกว่าหรือสูงกว่าค่าที่กำหนด
    const nextIndex = Math.min(
      FONT_SIZES.length - 1,
      Math.max(0, currentIndex + direction)
    );

    // อัปเดตขนาดตัวอักษรเป็นค่าใหม่
    setFontSize(FONT_SIZES[nextIndex]);
  };

  // ฟังก์ชันคืนค่าการช่วยการเข้าถึงกลับเป็นค่าเริ่มต้น
  const resetSettings = () => {
    setFontSize(100);
    setHighContrast(false);
  };

  return (
    // กล่องหลักใช้ relative เพื่อให้เมนูสามารถจัดตำแหน่งอ้างอิงกับปุ่มได้
    <div className="relative">
      {/* ปุ่มสำหรับเปิดหรือปิดเมนูช่วยการเข้าถึง */}
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

      {/* แสดงเมนูนี้เฉพาะเมื่อค่า open เป็น true */}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border border-[#8E6D4E]/20 bg-white p-4 text-[#4E3B2C] shadow-2xl dark:bg-[#1E1A16] dark:text-white">
          {/* ชื่อเมนู */}
          <p className="mb-3 text-sm font-bold">การช่วยการเข้าถึง</p>

          {/* ส่วนปรับขนาดตัวอักษร */}
          <div className="mb-3 flex items-center justify-between">
            {/* แสดงขนาดตัวอักษรปัจจุบัน */}
            <span className="text-xs">ขนาดตัวอักษร {fontSize}%</span>

            <div className="flex gap-1">
              {/* ปุ่มลดขนาดตัวอักษร */}
              {/* ปุ่มจะถูกปิดใช้งานเมื่อขนาดอยู่ที่ 100% */}
              <button
                type="button"
                onClick={() => changeFontSize(-1)}
                disabled={fontSize === 100}
                className="rounded-lg border px-3 py-2 font-bold disabled:opacity-40"
              >
                A−
              </button>

              {/* ปุ่มคืนขนาดตัวอักษรกลับเป็น 100% */}
              <button
                type="button"
                onClick={() => setFontSize(100)}
                className="rounded-lg border px-3 py-2 font-bold"
              >
                A
              </button>

              {/* ปุ่มเพิ่มขนาดตัวอักษร */}
              {/* ปุ่มจะถูกปิดใช้งานเมื่อขนาดอยู่ที่ 130% */}
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

          {/* ปุ่มเปิดหรือปิดโหมดคอนทราสต์สูง */}
          <button
            type="button"
            onClick={() => setHighContrast(!highContrast)}
            className="mb-2 w-full rounded-xl border border-[#8E6D4E]/30 px-3 py-2.5 text-xs font-bold"
            aria-pressed={highContrast}
          >
            ◐ คอนทราสต์สูงพื้นสว่าง: {highContrast ? "เปิด" : "ปิด"}
          </button>

          {/* ปุ่มคืนค่าทั้งหมดกลับเป็นค่าเริ่มต้น */}
          <button
            type="button"
            onClick={resetSettings}
            className="w-full rounded-xl px-3 py-2 text-xs text-stone-500 hover:bg-stone-100 dark:text-stone-300"
          >
            ↻ คืนค่าเดิม
          </button>
        </div>
      )}

      {/* CSS สำหรับโหมดคอนทราสต์สูง */}
      <style>{`
        /* กำหนดให้ส่วนควบคุมของเบราว์เซอร์ใช้รูปแบบสีสว่าง */
        html.a11y-high-contrast {
          color-scheme: light;
        }

        /* บังคับพื้นหลังของหน้าเว็บไซต์ให้เป็นสีขาว */
        html.a11y-high-contrast body {
          background-color: #ffffff !important;
        }

        /* เพิ่มความแตกต่างระหว่างสีและลดความสดของสีเล็กน้อย */
        html.a11y-high-contrast #root {
          filter: contrast(1.3) saturate(0.9);
        }

        /* ทำให้ลิงก์เป็นสีน้ำเงิน ขีดเส้นใต้ และตัวหนา */
        html.a11y-high-contrast body a {
          color: #003b8f !important;
          text-decoration: underline !important;
          text-decoration-thickness: 2px !important;
          font-weight: 700 !important;
        }

        /* ทำให้ปุ่มและช่องกรอกข้อมูลมีพื้นขาว ตัวอักษรดำ
           และเส้นขอบสีดำที่มองเห็นได้ชัดเจน */
        html.a11y-high-contrast body :where(button, input, textarea, select) {
          background-color: #ffffff !important;
          color: #111111 !important;
          border-color: #111111 !important;
          border-width: 2px !important;
          font-weight: 700 !important;
        }

        /* ทำให้ข้อความหรือไอคอนภายในปุ่มใช้สีเดียวกับปุ่ม */
        html.a11y-high-contrast body button * {
          color: inherit !important;
        }

        /* แสดงกรอบสีน้ำเงินที่ชัดเจนเมื่อใช้คีย์บอร์ดเลือกส่วนต่าง ๆ */
        html.a11y-high-contrast body
          :where(button, a, input, textarea, select):focus-visible {
          outline: 4px solid #005fcc !important;
          outline-offset: 3px !important;
        }
      `}</style>
    </div>
  );
}
