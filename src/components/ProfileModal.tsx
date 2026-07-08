import React, { useState, useEffect } from "react";
import { User, AppSettings } from "../types";
import { X, User as UserIcon, Mail, Key, Shield, Image as ImageIcon, Save, CheckCircle, AlertCircle, RefreshCw, Upload } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Language, getTranslation } from "../lib/translations";

interface ProfileModalProps {
  user: User | null;
  settings: AppSettings;
  onClose: () => void;
  onUpdateUser: (updatedUser: User) => void;
  lang: Language;
}

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80",
];

export default function ProfileModal({
  user,
  settings,
  onClose,
  onUpdateUser,
  lang,
}: ProfileModalProps) {
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Auto clear message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith("image/")) {
      setMessage({
        text: lang === "zh" ? "请选择有效的图片文件" : lang === "en" ? "Please select a valid image file" : "กรุณาเลือกไฟล์รูปภาพที่ถูกต้องค่ะ",
        type: "error"
      });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          filename: file.name,
          base64Data
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setAvatarUrl(data.url);
      setMessage({
        text: lang === "zh" ? "头像上传成功！" : lang === "en" ? "Avatar uploaded successfully!" : "อัปโหลดรูปภาพโปรไฟล์สำเร็จแล้วค่ะ!",
        type: "success"
      });
    } catch (err: any) {
      console.error("Upload error:", err);
      setMessage({
        text: lang === "zh" ? "上传失败：" + err.message : lang === "en" ? "Upload failed: " + err.message : "อัปโหลดรูปภาพล้มเหลว: " + err.message,
        type: "error"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  if (!user) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Basic Validations
    if (!username.trim()) {
      setMessage({
        text: lang === "zh" ? "名称不能为空" : lang === "en" ? "Username cannot be empty" : "ชื่อผู้ใช้ไม่สามารถเว้นว่างได้",
        type: "error",
      });
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setMessage({
        text: lang === "zh" ? "请输入有效的邮箱地址" : lang === "en" ? "Please enter a valid email address" : "กรุณากรอกอีเมลที่ถูกต้อง",
        type: "error",
      });
      return;
    }

    // Password change validations
    if (newPassword) {
      if (user.password && !currentPassword) {
        setMessage({
          text: lang === "zh" ? "请输入当前密码以确认更改" : lang === "en" ? "Please enter current password to verify" : "กรุณาระบุรหัสผ่านปัจจุบันเพื่อทำรายการเปลี่ยนรหัสผ่าน",
          type: "error",
        });
        return;
      }
      if (newPassword.length < 4) {
        setMessage({
          text: lang === "zh" ? "新密码长度至少为 4 个字符" : lang === "en" ? "New password must be at least 4 characters" : "รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 4 ตัวอักษร",
          type: "error",
        });
        return;
      }
      if (newPassword !== confirmPassword) {
        setMessage({
          text: lang === "zh" ? "两次输入的新密码不一致" : lang === "en" ? "New passwords do not match" : "รหัสผ่านใหม่และรหัสผ่านยืนยันไม่ตรงกัน",
          type: "error",
        });
        return;
      }
    }

    setLoading(true);

    try {
      const response = await fetch("/api/users/profile/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          avatarUrl: avatarUrl.trim(),
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์");
      }

      setMessage({
        text: lang === "zh" ? "个人资料更新成功！" : lang === "en" ? "Profile updated successfully!" : "อัปเดตข้อมูลส่วนตัวเรียบร้อยแล้วค่ะ!",
        type: "success",
      });

      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Callback to update parent state
      onUpdateUser(data.user);
    } catch (err: any) {
      setMessage({
        text: err.message || "Something went wrong",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-950/70 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg rounded-3xl bg-[#FAF7F2] dark:bg-[#1C1815] border border-[#8E6D4E]/25 p-5 sm:p-7 shadow-2xl z-10 flex flex-col max-h-[92vh] text-[#4E3B2C] dark:text-stone-200 overflow-y-auto"
      >
        {/* Header decoration */}
        <div className="flex items-center justify-between border-b border-[#8E6D4E]/10 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-[#8E6D4E]/10 text-[#8E6D4E]">
              <UserIcon size={20} className="animate-pulse" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-[#4E3B2C] dark:text-[#EAE3DA] tracking-tight">
                {lang === "zh" ? "修改个人资料" : lang === "en" ? "Edit User Profile" : "แก้ไขข้อมูลส่วนตัว"}
              </h3>
              <p className="text-[10px] sm:text-xs text-stone-450 dark:text-stone-400 font-medium">
                {lang === "zh" ? "修改您的名字、电子邮箱、头像及安全密码" : lang === "en" ? "Update your personal credentials, profile picture and security password" : "ตั้งค่าบัญชี ปรับแต่งข้อมูลประจำตัว และเปลี่ยนรหัสผ่านเพื่อความปลอดภัย"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Message Banner */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-3 rounded-xl flex items-center gap-2 mb-4 text-xs font-bold ${
                message.type === "success"
                  ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                  : "bg-red-500/10 text-red-600 border border-red-500/20"
              }`}
            >
              {message.type === "success" ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
              <span>{message.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          {/* Avatar Section */}
          <div className="space-y-2">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-stone-450 dark:text-stone-400">
              {lang === "zh" ? "1. 用户头像设置" : lang === "en" ? "1. Avatar & Profile Image" : "1. ภาพโปรไฟล์ผู้ร่วมทาง"}
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-stone-50 dark:bg-stone-900/40 rounded-2xl border border-[#8E6D4E]/10">
              {/* Profile Image Preview */}
              <div className="relative group">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#8E6D4E] shadow-sm bg-stone-200 dark:bg-stone-800 flex items-center justify-center flex-shrink-0">
                  {avatarUrl ? (
                    <img referrerPolicy="no-referrer" src={avatarUrl} alt="Preview Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold text-[#8E6D4E]">{username.charAt(0).toUpperCase()}</span>
                  )}
                </div>
              </div>

              {/* Direct File Upload & Presets */}
              <div className="flex-1 w-full space-y-2.5">
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  className={`border border-dashed rounded-xl p-3 text-center cursor-pointer transition-colors relative flex flex-col items-center justify-center gap-1 ${
                    isDragOver 
                      ? "border-[#8E6D4E] bg-[#8E6D4E]/5" 
                      : "border-[#8E6D4E]/20 bg-white dark:bg-[#151210] hover:bg-stone-100/50 dark:hover:bg-[#201B18]"
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploading}
                  />
                  {uploading ? (
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#8E6D4E]">
                      <RefreshCw size={13} className="animate-spin" />
                      <span>
                        {lang === "zh" ? "正在上传头像..." : lang === "en" ? "Uploading image..." : "กำลังอัปโหลดรูปภาพ..."}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-[#4E3B2C] dark:text-[#EAE3DA]">
                        <Upload size={13} className="text-[#8E6D4E]" />
                        <span>
                          {lang === "zh" ? "上传头像图片" : lang === "en" ? "Upload avatar image" : "เลือกรูปภาพโปรไฟล์จากอุปกรณ์"}
                        </span>
                      </div>
                      <span className="text-[9px] text-stone-400">
                        {lang === "zh" ? "支持拖拽或点击选择图片" : lang === "en" ? "Supports drag & drop or click to pick" : "ลากรูปภาพมาวาง หรือคลิกเพื่อเลือกไฟล์"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Preset Picker */}
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-stone-400 uppercase">
                    {lang === "zh" ? "或选择内置头像推荐:" : lang === "en" ? "Or pick a beautiful preset avatar:" : "หรือเลือกภาพโปรไฟล์สำเร็จรูปที่เตรียมไว้ให้:"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_AVATARS.map((url, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setAvatarUrl(url)}
                        className={`w-8 h-8 rounded-full overflow-hidden border transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                          avatarUrl === url ? "border-[#8E6D4E] ring-2 ring-[#8E6D4E]/30" : "border-transparent opacity-80 hover:opacity-100"
                        }`}
                      >
                        <img referrerPolicy="no-referrer" src={url} alt={`Preset ${index + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setAvatarUrl("")}
                      className="text-[9px] font-bold text-[#8E6D4E] hover:underline px-1 cursor-pointer"
                    >
                      {lang === "zh" ? "重置" : lang === "en" ? "Reset" : "ใช้ตัวอักษรย่อ"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User Details */}
          <div className="space-y-3">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-stone-450 dark:text-stone-400 block">
              {lang === "zh" ? "2. 账号基本信息" : lang === "en" ? "2. General Account Credentials" : "2. ข้อมูลทั่วไปของบัญชีผู้ร่วมทาง"}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold text-[#4E3B2C] dark:text-[#EAE3DA]">
                  {lang === "zh" ? "登录名称 / 用户名:" : lang === "en" ? "Username:" : "ชื่อบัญชี / ชื่อผู้ใช้:"}
                </span>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <UserIcon size={13} />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-[#151210] border border-[#8E6D4E]/20 text-[#4E3B2C] dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-[#8E6D4E] focus:border-[#8E6D4E]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold text-[#4E3B2C] dark:text-[#EAE3DA]">
                  {lang === "zh" ? "电子邮箱 / Email:" : lang === "en" ? "Email Address:" : "ที่อยู่อีเมล:"}
                </span>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Mail size={13} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-[#151210] border border-[#8E6D4E]/20 text-[#4E3B2C] dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-[#8E6D4E] focus:border-[#8E6D4E]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Change Password Panel */}
          <div className="space-y-3 pt-1 border-t border-[#8E6D4E]/10">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-stone-450 dark:text-stone-400">
                {lang === "zh" ? "3. 修改账户密码 (选填)" : lang === "en" ? "3. Security & Password Update (Optional)" : "3. เปลี่ยนรหัสผ่านความปลอดภัย (หากต้องการ)"}
              </label>
              <span className="text-[8px] bg-[#8E6D4E]/10 text-[#8E6D4E] px-1.5 py-0.5 rounded font-bold uppercase">
                {lang === "zh" ? "仅修改时填写" : lang === "en" ? "Leave blank to keep" : "ปล่อยว่างหากไม่เปลี่ยน"}
              </span>
            </div>

            {/* Current Password - only show if user has password and wants to set new password */}
            {newPassword && user.password && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold text-[#4E3B2C] dark:text-[#EAE3DA]">
                  {lang === "zh" ? "当前旧密码 (以核实身份):" : lang === "en" ? "Current Old Password (To verify):" : "รหัสผ่านปัจจุบันของคุณ (เพื่อยืนยันตัวตน):"} <span className="text-red-500">*</span>
                </span>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Key size={13} />
                  </div>
                  <input
                    type="password"
                    required={!!newPassword}
                    placeholder={lang === "zh" ? "输入当前的旧登录密码" : lang === "en" ? "Enter current login password" : "กรอกรหัสผ่านเข้าสู่ระบบที่ใช้อยู่ในปัจจุบัน"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-[#151210] border border-[#8E6D4E]/20 text-[#4E3B2C] dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-[#8E6D4E] focus:border-[#8E6D4E]"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold text-[#4E3B2C] dark:text-[#EAE3DA]">
                  {lang === "zh" ? "输入新密码:" : lang === "en" ? "New Password:" : "รหัสผ่านใหม่:"}
                </span>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Key size={13} />
                  </div>
                  <input
                    type="password"
                    placeholder={lang === "zh" ? "留空表示不修改" : lang === "en" ? "Blank to keep original" : "เว้นว่างไว้หากไม่ต้องการเปลี่ยน"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-[#151210] border border-[#8E6D4E]/20 text-[#4E3B2C] dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-[#8E6D4E] focus:border-[#8E6D4E]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold text-[#4E3B2C] dark:text-[#EAE3DA]">
                  {lang === "zh" ? "确认新密码:" : lang === "en" ? "Confirm New Password:" : "ยืนยันรหัสผ่านใหม่:"}
                </span>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Shield size={13} />
                  </div>
                  <input
                    type="password"
                    placeholder={lang === "zh" ? "再次输入新密码" : lang === "en" ? "Type new password again" : "กรอกรหัสผ่านใหม่อีกครั้งเพื่อยืนยัน"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-[#151210] border border-[#8E6D4E]/20 text-[#4E3B2C] dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-[#8E6D4E] focus:border-[#8E6D4E]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#8E6D4E]/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-[#4E3B2C] dark:text-stone-300 text-xs font-bold transition-all cursor-pointer"
            >
              {lang === "zh" ? "取消" : lang === "en" ? "Cancel" : "ยกเลิก"}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-[#8E6D4E] hover:bg-[#725437] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-[#8E6D4E]/10 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              <span>
                {loading
                  ? (lang === "zh" ? "正在保存..." : lang === "en" ? "Saving..." : "กำลังบันทึกข้อมูล...")
                  : (lang === "zh" ? "保存更改" : lang === "en" ? "Save Changes" : "บันทึกการเปลี่ยนแปลง")}
              </span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
