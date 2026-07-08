import { useState } from "react";
import { Coins, Sun, Moon, LogOut, Settings, LayoutDashboard, UserPlus, LogIn, Menu, X, Compass, Palette, User as UserIcon, Globe, MessageSquare, ShoppingCart } from "lucide-react";
import { User, AppSettings } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { Language, getTranslation } from "../lib/translations";

interface HeaderProps {
  user: User | null;
  settings: AppSettings;
  theme: "dark" | "light";
  toggleTheme: () => void;
  onOpenAuth: (type: "login" | "register") => void;
  onOpenTopup: () => void;
  onOpenAdmin: () => void;
  onOpenHistory: () => void;
  onOpenSellerDashboard: () => void;
  onLogout: () => void;
  lang: Language;
  setLang: (lang: Language) => void;
  onOpenChat: () => void;
  cartItemsCount: number;
  onOpenCart: () => void;
  onOpenProfile: () => void;
}

export default function Header({
  user,
  settings,
  theme,
  toggleTheme,
  onOpenAuth,
  onOpenTopup,
  onOpenAdmin,
  onOpenHistory,
  onOpenSellerDashboard,
  onLogout,
  lang,
  setLang,
  onOpenChat,
  cartItemsCount,
  onOpenCart,
  onOpenProfile
}: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const badgeBg = "bg-[#8E6D4E]/10 border-[#8E6D4E]/25 text-[#725437] dark:text-[#D1BEA8]";
  const glowButton = "bg-[#8E6D4E] hover:bg-[#725437] text-white font-medium transition-all duration-300 rounded-xl px-4 py-2 text-xs shadow-md shadow-[#8E6D4E]/10 hover:shadow-[#8E6D4E]/20";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#8E6D4E]/10 bg-[#FAF7F2]/95 dark:bg-[#141210]/95 backdrop-blur-md transition-colors duration-300" id="main-header">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo and Brand */}
        <div className="flex items-center gap-2">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-2"
          >
            {settings.siteLogoUrl ? (
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden border border-[#8E6D4E]/20 bg-[#FAF7F2] dark:bg-[#1E1916] flex items-center justify-center">
                <img src={settings.siteLogoUrl} alt="Logo" className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="p-1.5 rounded-xl border border-[#8E6D4E]/20 bg-[#FAF7F2] dark:bg-[#1E1916] text-[#8E6D4E]">
                <Palette className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            )}
            <span className="text-base sm:text-xl font-bold font-serif tracking-tight text-[#4E3B2C] dark:text-[#EAE3DA]">
              {settings.siteName}
            </span>
          </motion.div>
        </div>

        {/* Center Menus (Desktop) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#735A45] dark:text-[#C5B49E]">
          <a href="#homepage" className="relative transition-colors hover:text-[#8E6D4E] after:absolute after:bottom-[-4px] after:left-0 after:h-[1.5px] after:w-0 hover:after:w-full after:bg-[#8E6D4E] after:transition-all after:duration-300">{getTranslation(lang, "home")}</a>
          <a href="#about-us-section" className="relative transition-colors hover:text-[#8E6D4E] after:absolute after:bottom-[-4px] after:left-0 after:h-[1.5px] after:w-0 hover:after:w-full after:bg-[#8E6D4E] after:transition-all after:duration-300">{getTranslation(lang, "aboutUs")}</a>
          <a href="#portfolios-section" className="relative transition-colors hover:text-[#8E6D4E] after:absolute after:bottom-[-4px] after:left-0 after:h-[1.5px] after:w-0 hover:after:w-full after:bg-[#8E6D4E] after:transition-all after:duration-300">{getTranslation(lang, "portfolios")}</a>
          <a href="#artisans-section" className="relative transition-colors hover:text-[#8E6D4E] after:absolute after:bottom-[-4px] after:left-0 after:h-[1.5px] after:w-0 hover:after:w-full after:bg-[#8E6D4E] after:transition-all after:duration-300">{getTranslation(lang, "artisans")}</a>
          <a href="#recommended-products" className="relative transition-colors hover:text-[#8E6D4E] after:absolute after:bottom-[-4px] after:left-0 after:h-[1.5px] after:w-0 hover:after:w-full after:bg-[#8E6D4E] after:transition-all after:duration-300">{getTranslation(lang, "products")}</a>
          <a href={settings.contactFacebook || "#"} target="_blank" rel="noreferrer" className="relative transition-colors hover:text-[#8E6D4E] after:absolute after:bottom-[-4px] after:left-0 after:h-[1.5px] after:w-0 hover:after:w-full after:bg-[#8E6D4E] after:transition-all after:duration-300">{getTranslation(lang, "contactUs")}</a>
        </nav>

        {/* Right Section Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          
          {/* Language Selector Dropdown (Hidden on Mobile, handled inside mobile menu) */}
          <div className="relative hidden md:block">
            <button 
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="p-2 rounded-xl text-[#735A45] hover:text-[#8E6D4E] hover:bg-[#8E6D4E]/5 dark:text-[#C5B49E] dark:hover:text-[#FAF7F2] transition-colors flex items-center gap-1.5 cursor-pointer text-xs font-bold"
              title="เปลี่ยนภาษา / Change Language"
            >
              <Globe size={15} />
              <span className="uppercase text-[10px]">
                {lang === "th" ? "TH 🇹🇭" : lang === "en" ? "EN 🇺🇸" : "ZH 🇨🇳"}
              </span>
            </button>

            <AnimatePresence>
              {langDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setLangDropdownOpen(false)}></div>
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 window-dropdown w-32 rounded-xl bg-[#FAF7F2] dark:bg-[#1E1A16] border border-[#8E6D4E]/20 shadow-xl p-1 z-20"
                  >
                    <button 
                      onClick={() => { setLang("th"); setLangDropdownOpen(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-left transition-colors cursor-pointer ${lang === 'th' ? 'bg-[#8E6D4E]/10 text-[#8E6D4E]' : 'text-[#4E3B2C] dark:text-slate-200 hover:bg-[#8E6D4E]/5'}`}
                    >
                      <span>🇹🇭</span>
                      <span>ภาษาไทย</span>
                    </button>
                    <button 
                      onClick={() => { setLang("en"); setLangDropdownOpen(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-left transition-colors cursor-pointer ${lang === 'en' ? 'bg-[#8E6D4E]/10 text-[#8E6D4E]' : 'text-[#4E3B2C] dark:text-slate-200 hover:bg-[#8E6D4E]/5'}`}
                    >
                      <span>🇺🇸</span>
                      <span>English</span>
                    </button>
                    <button 
                      onClick={() => { setLang("zh"); setLangDropdownOpen(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-left transition-colors cursor-pointer ${lang === 'zh' ? 'bg-[#8E6D4E]/10 text-[#8E6D4E]' : 'text-[#4E3B2C] dark:text-slate-200 hover:bg-[#8E6D4E]/5'}`}
                    >
                      <span>🇨🇳</span>
                      <span>中文</span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Theme Toggler (Hidden on Mobile, handled inside mobile menu) */}
          <button 
            id="theme-toggler"
            onClick={toggleTheme}
            className="p-2 rounded-xl text-[#735A45] hover:text-[#8E6D4E] hover:bg-[#8E6D4E]/5 dark:text-[#C5B49E] dark:hover:text-[#FAF7F2] transition-colors cursor-pointer hidden md:inline-flex"
            title={theme === "dark" ? "หน้าจอโหมดสว่าง" : "หน้าจอโหมดมืด"}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Shopping Cart Button */}
          <button
            onClick={onOpenCart}
            className="relative p-2 rounded-xl text-[#735A45] hover:text-[#8E6D4E] hover:bg-[#8E6D4E]/5 dark:text-[#C5B49E] dark:hover:text-[#FAF7F2] transition-colors cursor-pointer"
            title="ตะกร้าสินค้า (Shopping Cart)"
          >
            <ShoppingCart size={18} />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white font-sans text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-pulse">
                {cartItemsCount}
              </span>
            )}
          </button>

          {user ? (
            /* Logged in layout */
            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* Balance Badge (Hidden on mobile) */}
              <motion.button 
                whileHover={{ scale: 1.02 }}
                onClick={onOpenTopup}
                className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer ${badgeBg}`}
              >
                <Coins size={14} />
                <span>{user.balance.toFixed(2)} ฿</span>
                <span className="bg-[#8E6D4E] text-white px-1.5 py-0.5 rounded-lg text-[9px] uppercase font-bold">{getTranslation(lang, "supportBtn")}</span>
              </motion.button>

              {/* Account Dropdown */}
              <div className="relative">
                <button 
                  id="profile-dropdown-btn"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-[#FAF7F2] border border-[#8E6D4E]/20 text-[#4E3B2C] dark:bg-[#1E1A16] dark:text-[#ECE5DC] hover:border-[#8E6D4E]/40 transition-all text-sm cursor-pointer"
                >
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="w-5 h-5 rounded-full object-cover" />
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-[#8E6D4E]/10 flex items-center justify-center text-[10px] font-bold text-[#8E6D4E]">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className="font-semibold max-w-[80px] truncate hidden sm:inline-block">{user.username}</span>
                  <span className="text-[10px] opacity-60 hidden sm:inline-block">▼</span>
                </button>

                {/* Dropdown Box */}
                <AnimatePresence>
                  {dropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)}></div>
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-52 rounded-xl bg-[#FAF7F2] dark:bg-[#1E1A16] border border-[#8E6D4E]/20 shadow-xl p-1.5 z-20 text-[#4E3B2C] dark:text-stone-200"
                      >
                        <div className="px-3 py-2 border-b border-[#8E6D4E]/10">
                          <p className="text-[10px] font-semibold text-[#8E6D4E]">{getTranslation(lang, "rolePanel")}</p>
                          <p className={`text-xs font-bold truncate ${user.role === 'admin' ? 'text-amber-700 dark:text-amber-400' : 'text-[#4E3B2C] dark:text-slate-200'}`}>
                            {user.role === 'admin' ? getTranslation(lang, "adminRole") : getTranslation(lang, "memberRole")}
                          </p>
                        </div>

                        <button 
                          onClick={() => { setDropdownOpen(false); onOpenProfile(); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#8E6D4E] hover:bg-[#8E6D4E]/5 rounded-lg transition-colors text-left cursor-pointer"
                        >
                          <UserIcon size={14} />
                          <span>{lang === "zh" ? "修改个人资料" : lang === "en" ? "Edit Profile" : "แก้ไขโปรไฟล์ส่วนตัว"}</span>
                        </button>
                        
                        {user.role === 'admin' && (
                          <button 
                            onClick={() => { setDropdownOpen(false); onOpenAdmin(); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-[#8E6D4E]/5 rounded-lg transition-colors text-left cursor-pointer"
                          >
                            <LayoutDashboard size={14} />
                            <span>{getTranslation(lang, "adminDashboard")}</span>
                          </button>
                        )}

                        <button 
                          onClick={() => { setDropdownOpen(false); onOpenSellerDashboard(); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:bg-[#8E6D4E]/5 rounded-lg transition-colors text-left cursor-pointer"
                        >
                          <Settings size={14} />
                          <span>{user.role?.startsWith('seller') ? "แผงควบคุมร้านค้า" : "สมัครเป็นผู้ขาย"}</span>
                        </button>

                        <button 
                          onClick={() => { setDropdownOpen(false); onOpenChat(); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-[#8E6D4E]/5 rounded-lg transition-colors text-left cursor-pointer"
                        >
                          <MessageSquare size={14} />
                          <span>
                            {user.role === "admin" ? "จัดการระบบแชทชุมชน" : 
                             user.role?.startsWith("seller") ? "ข้อความจากลูกค้า" : "แชทของฉัน (My Chat)"}
                          </span>
                        </button>

                        <button 
                          onClick={() => { setDropdownOpen(false); onOpenHistory(); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#4E3B2C] dark:text-slate-300 hover:bg-[#8E6D4E]/5 rounded-lg transition-colors text-left cursor-pointer"
                        >
                          <Coins size={14} />
                          <span>{getTranslation(lang, "purchaseHistory")}</span>
                        </button>

                        <button 
                          onClick={() => { setDropdownOpen(false); onLogout(); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-500/5 rounded-lg transition-colors text-left cursor-pointer"
                        >
                          <LogOut size={14} />
                          <span>{getTranslation(lang, "logout")}</span>
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            /* Guest login actions */
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => onOpenAuth("login")}
                className="px-3 py-1.5 sm:px-5 sm:py-2 rounded-xl border border-stone-700/60 hover:border-[#8E6D4E]/60 text-[#C5B49E] hover:text-white text-xs font-semibold flex items-center gap-1.5 sm:gap-2 bg-[#1A1613]/40 hover:bg-[#8E6D4E]/10 transition-all duration-300 cursor-pointer"
              >
                <UserIcon size={13} className="text-[#C5B49E]" />
                <span>{getTranslation(lang, "login")}</span>
              </button>
            </div>
          )}

          {/* Mobile Menu Toggler */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex md:hidden p-2 rounded-xl text-[#735A45] hover:text-[#8E6D4E] hover:bg-[#8E6D4E]/5 transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-[#8E6D4E]/10 bg-[#FAF7F2] dark:bg-[#141210] px-4 py-4 space-y-4 font-medium text-[#735A45] dark:text-[#C5B49E] text-sm overflow-hidden"
          >
            {/* 1. Mobile Profile Summary Panel */}
            {user ? (
              <div className="p-4 rounded-2xl bg-[#8E6D4E]/5 dark:bg-[#1E1A16]/50 border border-[#8E6D4E]/15 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="w-12 h-12 rounded-full border border-[#8E6D4E]/20 object-cover" />
                  ) : (
                    <span className="w-12 h-12 rounded-full bg-[#8E6D4E]/10 flex items-center justify-center text-lg font-bold text-[#8E6D4E] border border-[#8E6D4E]/20">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-sm text-[#4E3B2C] dark:text-[#EAE3DA] truncate">{user.username}</p>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#8E6D4E]/10 text-[#8E6D4E]">
                      {user.role === 'admin' ? getTranslation(lang, "adminRole") : getTranslation(lang, "memberRole")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#8E6D4E]/10 text-xs">
                  <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300">
                    <Coins size={14} className="text-[#8E6D4E]" />
                    <span>{getTranslation(lang, "balance") || "ยอดเงินคงเหลือ"}: <span className="font-bold">{user.balance.toFixed(2)} ฿</span></span>
                  </div>
                  <button 
                    onClick={() => { setMobileMenuOpen(false); onOpenTopup(); }}
                    className="px-2.5 py-1 text-[10px] font-extrabold rounded-lg bg-[#8E6D4E] text-white hover:bg-[#725437] transition-all cursor-pointer"
                  >
                    {getTranslation(lang, "supportBtn")}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#8E6D4E]/10">
                  <button 
                    onClick={() => { setMobileMenuOpen(false); onOpenProfile(); }}
                    className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-white dark:bg-[#151210] border border-[#8E6D4E]/15 hover:border-[#8E6D4E]/30 text-xs font-bold text-[#4E3B2C] dark:text-stone-200 transition-all cursor-pointer"
                  >
                    <UserIcon size={13} className="text-[#8E6D4E]" />
                    <span>แก้ไขโปรไฟล์</span>
                  </button>
                  {user.role === 'admin' && (
                    <button 
                      onClick={() => { setMobileMenuOpen(false); onOpenAdmin(); }}
                      className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold transition-all cursor-pointer"
                    >
                      <LayoutDashboard size={13} />
                      <span>ระบบแอดมิน</span>
                    </button>
                  )}
                  <button 
                    onClick={() => { setMobileMenuOpen(false); onOpenSellerDashboard(); }}
                    className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-teal-400 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Settings size={13} />
                    <span>{user.role?.startsWith('seller') ? "แผงผู้ขาย" : "สมัครเป็นผู้ขาย"}</span>
                  </button>
                  <button 
                    onClick={() => { setMobileMenuOpen(false); onOpenChat(); }}
                    className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition-all cursor-pointer"
                  >
                    <MessageSquare size={13} />
                    <span>แชทชุมชน</span>
                  </button>
                  <button 
                    onClick={() => { setMobileMenuOpen(false); onOpenHistory(); }}
                    className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-white dark:bg-[#151210] border border-[#8E6D4E]/15 hover:border-[#8E6D4E]/30 text-xs font-bold text-[#4E3B2C] dark:text-stone-200 transition-all cursor-pointer col-span-2"
                  >
                    <Coins size={13} className="text-[#8E6D4E]" />
                    <span>{getTranslation(lang, "purchaseHistory")}</span>
                  </button>
                </div>

                <button 
                  onClick={() => { setMobileMenuOpen(false); onLogout(); }}
                  className="w-full mt-1 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 hover:text-red-700 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <LogOut size={13} />
                  <span>{getTranslation(lang, "logout")}</span>
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#8E6D4E]/5 dark:bg-[#1E1A16]/30 border border-[#8E6D4E]/15 flex flex-col gap-2.5">
                <p className="text-xs text-stone-500 dark:text-stone-400 text-center font-bold">
                  {lang === "zh" ? "登录解锁更多功能" : lang === "en" ? "Log in to unlock features" : "เข้าสู่ระบบเพื่อเปิดใช้งานฟังก์ชันพิเศษ"}
                </p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setMobileMenuOpen(false); onOpenAuth("login"); }}
                    className="flex-1 py-2.5 text-center text-xs font-bold rounded-xl bg-white dark:bg-[#1E1A16] border border-[#8E6D4E]/20 text-[#4E3B2C] dark:text-slate-200 transition-all cursor-pointer"
                  >
                    {getTranslation(lang, "login")}
                  </button>
                  <button 
                    onClick={() => { setMobileMenuOpen(false); onOpenAuth("register"); }}
                    className="flex-1 py-2.5 text-center text-xs font-bold rounded-xl bg-[#8E6D4E] text-white hover:bg-[#725437] transition-all cursor-pointer"
                  >
                    {getTranslation(lang, "register")}
                  </button>
                </div>
              </div>
            )}

            {/* 2. Mobile Language and Theme Row */}
            <div className="p-3 rounded-2xl bg-stone-100/60 dark:bg-stone-900/40 border border-[#8E6D4E]/5 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-600 dark:text-stone-400">
                  {theme === "dark" ? "🌙 โหมดมืด" : "☀️ โหมดสว่าง"}
                </span>
                <button 
                  onClick={toggleTheme}
                  className="p-1.5 rounded-lg bg-white dark:bg-[#1E1A16] border border-[#8E6D4E]/25 text-[#8E6D4E] hover:bg-[#8E6D4E]/5 transition-all cursor-pointer flex items-center justify-center"
                >
                  {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
                </button>
              </div>

              {/* Quick Language Switcher */}
              <div className="flex gap-1 bg-white/50 dark:bg-[#141210]/50 p-0.5 rounded-lg border border-[#8E6D4E]/10">
                <button 
                  onClick={() => setLang("th")}
                  className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${lang === 'th' ? 'bg-[#8E6D4E] text-white' : 'text-stone-500 hover:bg-[#8E6D4E]/5'}`}
                >
                  🇹🇭 TH
                </button>
                <button 
                  onClick={() => setLang("en")}
                  className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${lang === 'en' ? 'bg-[#8E6D4E] text-white' : 'text-stone-500 hover:bg-[#8E6D4E]/5'}`}
                >
                  🇺🇸 EN
                </button>
                <button 
                  onClick={() => setLang("zh")}
                  className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${lang === 'zh' ? 'bg-[#8E6D4E] text-white' : 'text-stone-500 hover:bg-[#8E6D4E]/5'}`}
                >
                  🇨🇳 ZH
                </button>
              </div>
            </div>

            {/* 3. Navigation Links */}
            <div className="py-2 space-y-1">
              <p className="text-[10px] font-extrabold text-[#8E6D4E] uppercase px-2.5 mb-2 tracking-wider">
                {lang === "zh" ? "导航" : lang === "en" ? "Navigation" : "เมนูนำทาง"}
              </p>
              <a href="#homepage" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-[#8E6D4E]/5 text-stone-600 dark:text-stone-300 hover:text-[#8E6D4E] font-semibold text-xs transition-all">
                🏠 {getTranslation(lang, "home")}
              </a>
              <a href="#about-us-section" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-[#8E6D4E]/5 text-stone-600 dark:text-stone-300 hover:text-[#8E6D4E] font-semibold text-xs transition-all">
                ℹ️ {getTranslation(lang, "aboutUs")}
              </a>
              <a href="#portfolios-section" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-[#8E6D4E]/5 text-stone-600 dark:text-stone-300 hover:text-[#8E6D4E] font-semibold text-xs transition-all">
                🎨 {getTranslation(lang, "portfolios")}
              </a>
              <a href="#artisans-section" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-[#8E6D4E]/5 text-stone-600 dark:text-stone-300 hover:text-[#8E6D4E] font-semibold text-xs transition-all">
                🤝 {getTranslation(lang, "artisans")}
              </a>
              <a href="#recommended-products" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-[#8E6D4E]/5 text-stone-600 dark:text-stone-300 hover:text-[#8E6D4E] font-semibold text-xs transition-all">
                🛍️ {getTranslation(lang, "products")}
              </a>
              <button 
                onClick={() => { setMobileMenuOpen(false); onOpenCart(); }} 
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl hover:bg-[#8E6D4E]/5 text-stone-600 dark:text-stone-300 hover:text-[#8E6D4E] font-semibold text-xs transition-all cursor-pointer"
              >
                <span className="flex items-center gap-2.5">🛒 {lang === "zh" ? "我的购物车" : lang === "en" ? "My Cart" : "ตะกร้าสินค้าของฉัน"}</span>
                <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[9px] font-extrabold">{cartItemsCount}</span>
              </button>
              <a href={settings.contactFacebook || "#"} target="_blank" rel="noreferrer" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-[#8E6D4E]/5 text-stone-600 dark:text-stone-300 hover:text-[#8E6D4E] font-semibold text-xs transition-all">
                📞 {getTranslation(lang, "contactUs")}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
