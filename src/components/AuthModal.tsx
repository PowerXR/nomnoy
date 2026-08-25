import React, { useState } from "react";
import { AppSettings, User } from "../types";
import {
  X,
  LogIn,
  UserPlus,
  ShieldAlert,
  ArrowRight,
  LockKeyhole,
  UserRound,
  Mail,
  Eye,
  EyeOff,
  Star,
  UsersRound,
  ShoppingBag,
  Store,
  ShieldCheck,
  Sparkles,
  CheckCircle2
} from "lucide-react";
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
  const [modalType, setModalType] =
    useState<"login" | "register">(initialType);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [loading, setLoading] = useState(false);

  const siteName =
    settings.siteName?.trim() || "ตลาดชุมชนน้ำน้อย";

  const siteSubtitle =
    settings.siteSubtitle?.trim() ||
    "ศูนย์รวมสินค้าชุมชน งานหัตถกรรม และผลิตภัณฑ์ท้องถิ่นคุณภาพ";

  const switchModalType = (type: "login" | "register") => {
    setModalType(type);
    setErrorText("");
    setPassword("");
    setShowPassword(false);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorText("");

    const url =
      modalType === "login"
        ? "/api/users/login"
        : "/api/users/register";

    const bodyData =
      modalType === "login"
        ? { username, password }
        : { username, email, password };

    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(bodyData)
      });

      const text = await resp.text();

      if (!text || text.trim().startsWith("<")) {
        setErrorText(
          "เซิร์ฟเวอร์ตอบกลับไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง"
        );
        return;
      }

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        setErrorText("ไม่สามารถอ่านข้อมูลจากเซิร์ฟเวอร์ได้");
        return;
      }

      if (!resp.ok) {
        setErrorText(
          data.error ||
            "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"
        );
        return;
      }

      onLoginSuccess(data);
      onClose();
    } catch {
      setErrorText(
        "ไม่สามารถเชื่อมต่อระบบได้ กรุณาตรวจสอบอินเทอร์เน็ต"
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full h-14 rounded-2xl border border-stone-200 bg-white " +
    "pl-12 pr-4 text-sm text-[#2C241E] placeholder:text-stone-400 " +
    "outline-none transition-all duration-300 " +
    "focus:border-[#A67C52] focus:ring-4 focus:ring-[#A67C52]/10 " +
    "disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#090705]/85 p-3 backdrop-blur-md sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 18 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 24
        }}
        onMouseDown={(event) => event.stopPropagation()}
        className="relative grid w-full max-w-6xl overflow-hidden rounded-[30px] border border-[#B68A5B]/30 bg-[#F8F5F0] shadow-[0_35px_100px_rgba(0,0,0,0.55)] lg:min-h-[680px] lg:grid-cols-[1.08fr_0.92fr]"
      >
        {/* ปุ่มปิด */}
        <button
          type="button"
          onClick={onClose}
          aria-label="ปิดหน้าต่าง"
          title="ปิดหน้าต่าง"
          className="absolute right-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white/90 text-stone-500 shadow-lg backdrop-blur transition-all hover:rotate-90 hover:border-[#A67C52] hover:text-[#8E6D4E] sm:right-6 sm:top-6"
        >
          <X size={19} />
        </button>

        {/* ฝั่งแนะนำเว็บไซต์ */}
        <section className="relative hidden overflow-hidden bg-[#17120F] p-12 text-white lg:flex lg:flex-col lg:justify-between">
          {/* แสงตกแต่ง */}
          <div className="pointer-events-none absolute -left-28 -top-28 h-80 w-80 rounded-full bg-[#C69A68]/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-[#8E6D4E]/20 blur-3xl" />

          <div className="pointer-events-none absolute inset-0 opacity-[0.035]">
            <div className="h-full w-full bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:46px_46px]" />
          </div>

          <div className="relative z-10">
            <div className="mb-10 inline-flex items-center gap-2 rounded-full border border-[#D2AA7A]/30 bg-[#D2AA7A]/10 px-4 py-2 text-xs font-bold tracking-wide text-[#E1BE91]">
              <Sparkles size={15} />
              ตลาดชุมชนออนไลน์
            </div>

            <h1 className="max-w-xl text-4xl font-black leading-tight sm:text-5xl">
              ยินดีต้อนรับสู่
              <span className="mt-3 block bg-gradient-to-r from-[#E8C89E] via-[#C99B68] to-[#F1D7B5] bg-clip-text text-transparent">
                {siteName}
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-8 text-stone-300">
              {siteSubtitle}
              <br />
              เลือกซื้อสินค้าอย่างมั่นใจ พร้อมสนับสนุนรายได้ให้กับคนในชุมชน
            </p>

            <div className="mt-9 grid max-w-xl grid-cols-2 gap-3">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#C89B69]/15 text-[#DFB783]">
                  <ShieldCheck size={20} />
                </div>

                <div>
                  <p className="text-sm font-bold text-white">
                    ซื้อขายมั่นใจ
                  </p>
                  <p className="mt-1 text-[11px] text-stone-400">
                    ระบบตรวจสอบผู้ซื้อจริง
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#C89B69]/15 text-[#DFB783]">
                  <CheckCircle2 size={20} />
                </div>

                <div>
                  <p className="text-sm font-bold text-white">
                    สินค้าคัดสรร
                  </p>
                  <p className="mt-1 text-[11px] text-stone-400">
                    จากร้านค้าภายในชุมชน
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ข้อมูลด้านล่าง */}
          <div className="relative z-10 grid grid-cols-3 divide-x divide-white/10 border-t border-white/10 pt-7">
            <div className="pr-5">
              <div className="flex items-center gap-2 text-[#E0B57F]">
                <Star size={17} fill="currentColor" />
                <span className="text-sm font-black">
                  รีวิวจริง
                </span>
              </div>
              <p className="mt-2 text-[11px] text-stone-400">
                จากผู้ซื้อสินค้า
              </p>
            </div>

            <div className="px-5">
              <div className="flex items-center gap-2 text-[#E0B57F]">
                <UsersRound size={17} />
                <span className="text-sm font-black">
                  ชุมชน
                </span>
              </div>
              <p className="mt-2 text-[11px] text-stone-400">
                ร้านค้าท้องถิ่น
              </p>
            </div>

            <div className="pl-5">
              <div className="flex items-center gap-2 text-[#E0B57F]">
                <ShoppingBag size={17} />
                <span className="text-sm font-black">
                  ปลอดภัย
                </span>
              </div>
              <p className="mt-2 text-[11px] text-stone-400">
                ติดตามคำสั่งซื้อ
              </p>
            </div>
          </div>
        </section>

        {/* ฝั่งฟอร์ม */}
        <section className="relative flex items-center px-5 py-8 sm:px-10 sm:py-12 lg:px-14">
          <div className="mx-auto w-full max-w-md">
            {/* โลโก้สำหรับมือถือ */}
            <div className="mb-7 flex items-center gap-3 pr-12 lg:hidden">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#211A15] text-[#E2B982] shadow-lg">
                <Store size={21} />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#A67C52]">
                  ตลาดชุมชนออนไลน์
                </p>
                <p className="truncate text-base font-black text-[#2C241E]">
                  {siteName}
                </p>
              </div>
            </div>

            {/* หัวข้อ */}
            <AnimatePresence mode="wait">
              <motion.div
                key={modalType}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-2 flex items-center gap-2 text-[#9A7049]">
                  {modalType === "login" ? (
                    <LogIn size={18} />
                  ) : (
                    <UserPlus size={18} />
                  )}

                  <span className="text-xs font-black uppercase tracking-[0.12em]">
                    {modalType === "login"
                      ? "Member Login"
                      : "Create Account"}
                  </span>
                </div>

                <h2 className="text-3xl font-black tracking-tight text-[#211A15]">
                  {modalType === "login"
                    ? "เข้าสู่ระบบ"
                    : "สมัครสมาชิกใหม่"}
                </h2>

                <p className="mt-2 text-sm leading-6 text-stone-500">
                  {modalType === "login"
                    ? "กรอกข้อมูลบัญชีเพื่อเข้าสู่ระบบตลาดชุมชน"
                    : "สร้างบัญชีเพื่อสั่งซื้อสินค้าและใช้งานระบบสมาชิก"}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* ปุ่มเลือกล็อกอิน/สมัคร */}
            <div className="mt-7 grid grid-cols-2 rounded-2xl bg-[#EDE7DF] p-1.5">
              <button
                type="button"
                disabled={loading}
                onClick={() => switchModalType("login")}
                className={`flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all ${
                  modalType === "login"
                    ? "bg-white text-[#7F5A38] shadow-md"
                    : "text-stone-500 hover:text-[#7F5A38]"
                }`}
              >
                <LogIn size={16} />
                เข้าสู่ระบบ
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => switchModalType("register")}
                className={`flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all ${
                  modalType === "register"
                    ? "bg-white text-[#7F5A38] shadow-md"
                    : "text-stone-500 hover:text-[#7F5A38]"
                }`}
              >
                <UserPlus size={16} />
                สมัครสมาชิก
              </button>
            </div>

            <form
              onSubmit={handleAuthSubmit}
              className="mt-7 space-y-5"
            >
              {/* Username */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-[#332820]">
                  ชื่อบัญชีผู้ใช้
                </label>

                <div className="relative">
                  <UserRound
                    size={19}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                  />

                  <input
                    type="text"
                    required
                    autoComplete="username"
                    placeholder="กรอกชื่อบัญชีผู้ใช้"
                    disabled={loading}
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setErrorText("");
                    }}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Email ตอนสมัคร */}
              <AnimatePresence initial={false}>
                {modalType === "register" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -8 }}
                    animate={{
                      opacity: 1,
                      height: "auto",
                      y: 0
                    }}
                    exit={{
                      opacity: 0,
                      height: 0,
                      y: -8
                    }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-[#332820]">
                        อีเมล
                      </label>

                      <div className="relative">
                        <Mail
                          size={19}
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                        />

                        <input
                          type="email"
                          required={modalType === "register"}
                          autoComplete="email"
                          placeholder="name@example.com"
                          disabled={loading}
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setErrorText("");
                          }}
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-[#332820]">
                  รหัสผ่าน
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={19}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete={
                      modalType === "login"
                        ? "current-password"
                        : "new-password"
                    }
                    placeholder="กรอกรหัสผ่าน"
                    disabled={loading}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrorText("");
                    }}
                    className={`${inputClass} pr-12`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((current) => !current)
                    }
                    disabled={loading}
                    aria-label={
                      showPassword
                        ? "ซ่อนรหัสผ่าน"
                        : "แสดงรหัสผ่าน"
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 transition-colors hover:text-[#8E6D4E]"
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              <AnimatePresence>
                {errorText && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold leading-5 text-red-600"
                  >
                    <ShieldAlert
                      size={17}
                      className="mt-0.5 shrink-0"
                    />
                    <span>{errorText}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#9A7049] via-[#B18457] to-[#8A623F] text-sm font-black text-white shadow-[0_14px_30px_rgba(142,109,78,0.25)] transition-all hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    กำลังตรวจสอบข้อมูล...
                  </>
                ) : (
                  <>
                    {modalType === "login"
                      ? "เข้าสู่ระบบ"
                      : "สร้างบัญชีสมาชิก"}

                    <ArrowRight
                      size={17}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </form>

            {/* ความปลอดภัย */}
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-stone-200" />

              <div className="flex items-center gap-1.5 text-[11px] font-bold text-stone-400">
                <LockKeyhole size={13} />
                ปลอดภัย
              </div>

              <div className="h-px flex-1 bg-stone-200" />
            </div>

            <div className="rounded-2xl border border-[#A67C52]/15 bg-[#F2ECE4] px-4 py-3">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={18}
                  className="mt-0.5 shrink-0 text-[#9A7049]"
                />

                <p className="text-[11px] leading-5 text-stone-500">
                  ข้อมูลบัญชีของคุณจะใช้สำหรับการสั่งซื้อสินค้า
                  ติดตามสถานะ และเขียนรีวิวจากผู้ซื้อจริงเท่านั้น
                </p>
              </div>
            </div>

            {/* สลับโหมด */}
            <div className="mt-6 text-center">
              {modalType === "login" ? (
                <p className="text-sm text-stone-500">
                  ยังไม่มีบัญชี?{" "}
                  <button
                    type="button"
                    onClick={() => switchModalType("register")}
                    disabled={loading}
                    className="font-black text-[#8E6D4E] hover:underline"
                  >
                    สมัครสมาชิก
                  </button>
                </p>
              ) : (
                <p className="text-sm text-stone-500">
                  มีบัญชีอยู่แล้ว?{" "}
                  <button
                    type="button"
                    onClick={() => switchModalType("login")}
                    disabled={loading}
                    className="font-black text-[#8E6D4E] hover:underline"
                  >
                    เข้าสู่ระบบ
                  </button>
                </p>
              )}
            </div>
          </div>
        </section>
      </motion.div>
    </div>
  );
}
