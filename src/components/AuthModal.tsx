import React, { useState } from "react";
import { AppSettings, User } from "../types";
import { X, LogIn, UserPlus, ShieldAlert, ArrowRight, Disc, HelpCircle, Lock, UserCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AuthModalProps {
  initialType: "login" | "register";
  settings: AppSettings;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export default function AuthModal({
  initialType,
  settings,
  onClose,
  onLoginSuccess
}: AuthModalProps) {
  const [modalType, setModalType] = useState<"login" | "register">(initialType);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorText, setErrorText] = useState("");
  const [loading, setLoading] = useState(false);

  // Simulation LINE/Discord auth states
  const [discordSimulating, setDiscordSimulating] = useState(false);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorText("");

    const url = modalType === "login" ? "/api/users/login" : "/api/users/register";
    const bodyData = modalType === "login" 
      ? { username, password } 
      : { username, email, password };

    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData)
      });
      const text = await resp.text();
      if (!text || text.trim().startsWith("<")) {
        setErrorText("เซิร์ฟเวอร์ตอบรับรูปแบบไม่ถูกต้อง (รูปแบบ HTML)");
        return;
      }
      const data = JSON.parse(text);
      if (!resp.ok) {
        setErrorText(data.error || "เกิดข้อผิดพลาดในการตรวจสอบข้อมูลบัญชีผู้ใช้");
      } else {
        onLoginSuccess(data);
        onClose();
      }
    } catch (e) {
      setErrorText("เกิดปัญหาเชื่อมต่อระบบ เครือข่ายขัดข้อง");
    } finally {
      setLoading(false);
    }
  };

  const handleDiscordClick = () => {
    setDiscordSimulating(true);
    setErrorText("");

    // Beautiful animated simulated oauth sequence
    setTimeout(async () => {
      const userOptions = [
        { name: "KhunLaung_NamNoi", id: "9821831201" },
        { name: "Mali_OTOP", id: "5512110292" },
        { name: "Sompong_Artisan", id: "8821034491" }
      ];
      const selected = userOptions[Math.floor(Math.random() * userOptions.length)];

      try {
        const resp = await fetch("/api/users/discord-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            discordUsername: selected.name,
            discordId: selected.id,
            avatarUrl: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80`
          })
        });
        const text = await resp.text();
        if (!text || text.trim().startsWith("<")) {
          setErrorText("การจำลองล็อกอินล้มเหลว");
          return;
        }
        const data = JSON.parse(text);
        if (resp.ok) {
          onLoginSuccess(data);
          onClose();
        } else {
          setErrorText(data.error || "ล็อกอินออโต้ล่าช้า");
        }
      } catch (err) {
        setErrorText("การจำลองระบบเข้าสู่ระบบล้มเหลว");
      } finally {
        setDiscordSimulating(false);
      }
    }, 1500);
  };

  const activeColor = "text-[#8E6D4E]";
  const themeBtnGlow = "bg-[#8E6D4E] hover:bg-[#725437] text-white shadow-md shadow-[#8E6D4E]/10";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-950/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-sm max-h-[92vh] flex flex-col rounded-[24px] bg-[#FAF7F2] dark:bg-[#1C1815] border border-[#8E6D4E]/15 p-5 sm:p-7 shadow-2xl z-10 overflow-hidden text-[#4E3B2C] dark:text-stone-200"
      >
        {/* Header bar closer */}
        <div className="flex items-center justify-between pb-3 border-b border-[#8E6D4E]/10 relative z-10 flex-shrink-0">
          <div className="flex items-center gap-2">
            {modalType === "login" ? <LogIn size={16} className={activeColor} /> : <UserPlus size={16} className={activeColor} />}
            <span className="font-serif font-bold text-[#4E3B2C] dark:text-[#EAE3DA] text-[13px] uppercase">
              {modalType === "login" ? "เข้าสู่ระบบตลาดน้ำน้อย" : "ลงทะเบียนผู้ใช้อุดหนุน"}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full bg-stone-100 dark:bg-stone-850 text-stone-500 hover:text-[#8E6D4E] transition-all cursor-pointer hover:rotate-90 duration-250"
            title="ปิดหน้าต่างนี้"
          >
            <X size={15} />
          </button>
        </div>

        {/* Form area */}
        <div className="pt-4 relative z-10 space-y-4 overflow-y-auto flex-1 pr-1.5 scrollbar-thin">
          
          {/* Standard credential forms */}
          <form onSubmit={handleAuthSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-[10px] text-stone-500 uppercase font-black block">ชื่อบัญชีผู้ใช้งาน (Username) *</label>
              <input
                type="text"
                required
                placeholder="ระบุชื่อภาษาอังกฤษ เช่น wichit_noonoi..."
                disabled={loading || discordSimulating}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white dark:bg-[#151210] border border-[#8E6D4E]/15 rounded-xl px-3 py-2.5 text-xs text-[#4E3B2C] dark:text-stone-200 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#8E6D4E]"
              />
            </div>

            {modalType === "register" && (
              <div className="space-y-1">
                <label className="text-[10px] text-stone-500 uppercase font-black block">อีเมลติดต่อสะดวกรวดเร็ว *</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  disabled={loading || discordSimulating}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white dark:bg-[#151210] border border-[#8E6D4E]/15 rounded-xl px-3 py-2.5 text-xs text-[#4E3B2C] dark:text-stone-200 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#8E6D4E]"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] text-stone-500 uppercase font-black block">รหัสผ่านบัญชีส่วนบุคคล *</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                disabled={loading || discordSimulating}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white dark:bg-[#151210] border border-[#8E6D4E]/15 rounded-xl px-3 py-2.5 text-xs text-[#4E3B2C] dark:text-stone-200 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#8E6D4E]"
              />
            </div>

            {errorText && (
              <p className="text-[10px] font-bold text-red-500 flex items-center gap-1">
                <ShieldAlert size={12} />
                <span>{errorText}</span>
              </p>
            )}

            <button
              type="submit"
              disabled={loading || discordSimulating}
              className={`w-full py-3 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${themeBtnGlow}`}
            >
              <span>{loading ? "กำลังระบุสิทธิ..." : modalType === "login" ? "เข้าใช้ระบบชุมชนน้ำน้อย" : "ยืนยันสร้างสมาชิกใหม่"}</span>
            </button>
          </form>

          {/* Switch toggler */}
          <div className="pt-2 text-center">
            {modalType === "login" ? (
              <p className="text-[10px] text-stone-500 font-medium">
                ยังไม่มีบัญชีกับสหกรณ์?{" "}
                <button 
                  onClick={() => setModalType("register")}
                  className="text-[#8E6D4E] hover:underline font-bold ml-1 cursor-pointer"
                >
                  คลิกเพื่อสมัครสมาชิกใหม่ที่นี่ค่ะ
                </button>
              </p>
            ) : (
              <p className="text-[10px] text-stone-500 font-medium">
                มีบัญชีจัดส่งหัตถศิลป์แล้ว?{" "}
                <button
                  onClick={() => setModalType("login")}
                  className="text-[#8E6D4E] hover:underline font-bold ml-1 cursor-pointer"
                >
                  คลิกเข้าใช้ข้อมูลเดิมได้ทันที
                </button>
              </p>
            )}
          </div>

        </div>

      </motion.div>
    </div>
  );
}
