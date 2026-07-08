import React, { useState, useEffect } from "react";
import { AppSettings, Category, Product, User, Coupon, Transaction, Review, Landmark } from "../types";
import LucideIcon from "./LucideIcon";
import { 
  X, LayoutDashboard, Database, FolderHeart, Settings, Ticket, Code, Plus, Edit, Trash, Users, Percent, Gift, FileText, Check, Copy, HelpCircle, Eye, RefreshCw, Truck, Info, Palette, Award,
  Map as MapIcon, Compass, Trees, Building, Sparkles, Upload
} from "lucide-react";
import { motion } from "motion/react";

interface ImageUploaderProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
}

function ImageUploader({ label, value, onChange, placeholder }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("ขนาดไฟล์ต้องไม่เกิน 10MB");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        try {
          const res = await fetch("/api/upload", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              filename: file.name,
              base64Data,
            }),
          });

          if (!res.ok) {
            throw new Error("อัปโหลดไม่สำเร็จ");
          }

          const data = await res.json();
          onChange(data.url);
        } catch (err: any) {
          setError(err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
        } finally {
          setUploading(false);
        }
      };
      reader.onerror = () => {
        setError("ไม่สามารถอ่านไฟล์ได้");
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการอัปโหลด");
      setUploading(false);
    }
  };

  return (
    <div className="space-y-1.5 w-full">
      {label && <label className="block text-[10px] text-slate-400 font-medium">{label}</label>}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-slate-900 border border-white/10 rounded-lg p-2 text-white text-xs placeholder-slate-600 focus:outline-none focus:border-[#8E6D4E]/50 transition-colors"
          placeholder={placeholder || "ใส่ลิงก์รูปภาพ หรือกดปุ่มแนบรูปด้านขวา..."}
        />
        <label className="relative flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-white/10 rounded-lg text-xs font-semibold text-slate-200 cursor-pointer transition-all select-none min-w-[100px] text-center">
          {uploading ? (
            <>
              <RefreshCw size={13} className="animate-spin text-teal-400" />
              <span>กำลังโหลด...</span>
            </>
          ) : (
            <>
              <Plus size={13} className="text-teal-400" />
              <span>แนบรูป</span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>
      {error && <p className="text-[10px] text-red-400 font-light mt-1">⚠️ {error}</p>}
    </div>
  );
}

interface AdminPanelProps {
  user: User | null;
  settings: AppSettings;
  categories: Category[];
  products: Product[];
  coupons: Coupon[];
  onClose: () => void;
  onUpdateSettings: (settings: AppSettings) => Promise<void>;
  onRefreshData: () => void;
}

export default function AdminPanel({
  user,
  settings,
  categories,
  products,
  coupons,
  onClose,
  onUpdateSettings,
  onRefreshData
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "categories" | "coupons" | "users" | "settings" | "php-exporter" | "orders" | "about-us" | "portfolios" | "artisans" | "landmarks" | "seller-verifications" | "admin-withdrawals">("dashboard");
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Backup & Restore states
  const [backupLoading, setBackupLoading] = useState(false);
  const [backupSuccessMsg, setBackupSuccessMsg] = useState("");
  const [backupErrorMsg, setBackupErrorMsg] = useState("");

  // Custom confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {}
  });

  // Custom alert / toast state
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info";
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info"
  });

  const showCustomAlert = (title: string, message: string, type: "success" | "error" | "info" = "info") => {
    setAlertState({ isOpen: true, title, message, type });
  };

  // User management states
  const [usersList, setUsersList] = useState<User[]>([]);
  const [userListLoading, setUserListLoading] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userForm, setUserForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "user" as "user" | "admin",
    balance: 0
  });

  // Exporter code state
  const [exporterFiles, setExporterFiles] = useState<any[]>([]);
  const [exporterInstructions, setExporterInstructions] = useState("");
  const [activeFileTab, setActiveFileTab] = useState(0);
  const [copiedFileIndex, setCopiedFileIndex] = useState<number | null>(null);

  // Order & Shipping Tracking management states
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txLoading, setTxLoading] = useState(false);
  const [updatingTxId, setUpdatingTxId] = useState<string | null>(null);
  const [trackingForm, setTrackingForm] = useState({
    orderStatus: "preparing" as 'preparing' | 'shipped' | 'delivered' | 'cancelled',
    trackingNumber: "",
    trackingCarrier: "",
    note: ""
  });

  // Seller verifications & withdrawals admin state
  const [sellerVerifications, setSellerVerifications] = useState<any[]>([]);
  const [verificationsLoading, setVerificationsLoading] = useState(false);
  const [editingVrfId, setEditingVrfId] = useState<string | null>(null);
  const [adminWithdrawals, setAdminWithdrawals] = useState<any[]>([]);
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(false);
  const [withdrawalSlips, setWithdrawalSlips] = useState<Record<string, string>>({}); // withdrawal.id -> slipUrl
  const [uploadingSlipId, setUploadingSlipId] = useState<string | null>(null);

  const fetchVerifications = async () => {
    setVerificationsLoading(true);
    try {
      const res = await fetch("/api/admin/verifications", {
        headers: { "x-user-role": user?.role || "admin", "x-user-id": user?.id || "" }
      });
      if (res.ok) {
        const data = await res.json();
        setSellerVerifications(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setVerificationsLoading(false);
    }
  };

  const fetchAdminWithdrawals = async () => {
    setWithdrawalsLoading(true);
    try {
      const res = await fetch("/api/admin/withdrawals", {
        headers: { "x-user-role": user?.role || "admin", "x-user-id": user?.id || "" }
      });
      if (res.ok) {
        const data = await res.json();
        setAdminWithdrawals(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setWithdrawalsLoading(false);
    }
  };

  const handleReviewVerification = async (id: string, status: "approved" | "rejected", adminNotes: string) => {
    try {
      const res = await fetch(`/api/admin/verifications/${id}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": user?.role || "admin",
          "x-user-id": user?.id || ""
        },
        body: JSON.stringify({ status, adminNotes })
      });
      if (res.ok) {
        showCustomAlert("ดำเนินการสำเร็จ", `อัปเดตคำขอเป็น ${status === 'approved' ? 'อนุมัติผู้ขาย' : 'ปฏิเสธ'} เรียบร้อย`, "success");
        setEditingVrfId(null);
        fetchVerifications();
        onRefreshData();
      } else {
        const data = await res.json();
        showCustomAlert("ผิดพลาด", data.error || "เกิดข้อผิดพลาดในการตรวจสอบ", "error");
      }
    } catch (err) {
      showCustomAlert("ผิดพลาด", "ไม่สามารถติดต่อเซิร์ฟเวอร์ได้", "error");
    }
  };

  const handleReviewWithdrawal = async (id: string, status: "approved" | "rejected", adminNotes: string, slipUrl?: string) => {
    try {
      const res = await fetch(`/api/admin/withdrawals/${id}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": user?.role || "admin",
          "x-user-id": user?.id || ""
        },
        body: JSON.stringify({ status, adminNotes, slipUrl })
      });
      if (res.ok) {
        showCustomAlert("ดำเนินการสำเร็จ", `อัปเดตรายการคำขอถอนเงินเป็น ${status === 'approved' ? 'อนุมัติการโอนแล้ว' : 'ปฏิเสธคำขอเรียบร้อย'}`, "success");
        fetchAdminWithdrawals();
        onRefreshData();
      } else {
        const data = await res.json();
        showCustomAlert("ผิดพลาด", data.error || "เกิดข้อผิดพลาดในการอนุมัติถอนเงิน", "error");
      }
    } catch (err) {
      showCustomAlert("ผิดพลาด", "ไม่สามารถติดต่อเซิร์ฟเวอร์ได้", "error");
    }
  };

  // App settings editing copy state
  const [editedSettings, setEditedSettings] = useState<AppSettings>({ ...settings });
  const [newSlideUrl, setNewSlideUrl] = useState("");

  // Add Product form state
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    categoryId: categories[0]?.id || "",
    price: 0,
    imageUrl: "",
    description: "",
    details: "",
    videoUrl: "",
    stockText: "", // Raw string split by lines to populate stock array
    type: "normal" as "normal" | "box",
    boxItemsText: "" // JSON string format for simplicity
  });

  // Category form state
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    icon: "Folder",
    imageUrl: ""
  });

  // Coupons form state
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: "",
    discountPercent: 0,
    discountBaht: 0,
    usesLeft: 10
  });

  // Portfolio management states
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);
  const [editingPortfolioId, setEditingPortfolioId] = useState<string | null>(null);
  const [portfolioForm, setPortfolioForm] = useState({
    title: "",
    description: "",
    imageUrl: ""
  });

  // Artisan management states
  const [showArtisanForm, setShowArtisanForm] = useState(false);
  const [editingArtisanId, setEditingArtisanId] = useState<string | null>(null);
  const [artisanForm, setArtisanForm] = useState({
    name: "",
    expertise: "",
    bio: "",
    imageUrl: ""
  });

  // Landmark/Map management states
  const [showLandmarkForm, setShowLandmarkForm] = useState(false);
  const [editingLandmarkId, setEditingLandmarkId] = useState<string | null>(null);
  const [landmarkForm, setLandmarkForm] = useState<{
    name: string;
    type: 'admin' | 'craft' | 'temple' | 'nature' | 'market';
    lat: number;
    lng: number;
    description: string;
    phone?: string;
    imageUrl: string;
  }>({
    name: "",
    type: "craft",
    lat: 7.0518,
    lng: 100.5285,
    description: "",
    phone: "",
    imageUrl: ""
  });

  // Load Admin metrics stats
  const fetchDashStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/stats", {
        headers: { "X-User-Role": "admin" }
      });
      const text = await res.text();
      if (text && !text.trim().startsWith("<")) {
        const data = JSON.parse(text);
        setStats(data);
      } else {
        console.warn("Invalid admin stats response from server", text.slice(0, 100));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Load generated PHP source code files
  const fetchPHPScripts = async () => {
    try {
      const res = await fetch("/api/php-exporter/files");
      const text = await res.text();
      if (text && !text.trim().startsWith("<")) {
        const data = JSON.parse(text);
        if (data.success) {
          setExporterFiles(data.files);
          setExporterInstructions(data.instructions);
        }
      } else {
        console.warn("Invalid PHP files list response from server", text.slice(0, 100));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // User management operations
  const fetchUsers = async () => {
    try {
      setUserListLoading(true);
      const res = await fetch("/api/users", {
        headers: {
          "X-User-Role": "admin"
        }
      });
      const text = await res.text();
      if (text && !text.trim().startsWith("<")) {
        const data = JSON.parse(text);
        if (Array.isArray(data)) {
          setUsersList(data);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUserListLoading(false);
    }
  };

  const handleDeleteUser = (id: string) => {
    if (id === "usr-admin") {
      showCustomAlert("เกิดข้อผิดพลาด", "ไม่สามารถลบผู้ดูแลระบบหลัก (admin) เพื่อป้องกันข้อผิดพลาดทางสิทธิ์ระบบได้ค่ะ", "error");
      return;
    }
    setConfirmDialog({
      isOpen: true,
      title: "ยืนยันการลบผู้ใช้งาน",
      message: "คุณมั่นใจหรือไม่ว่าต้องการลบผู้ใช้งานรายนี้? ประวัติทั้งหมดจะถูกจำกัดสิทธิ์ทันที",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/users/${id}`, {
            method: "DELETE",
            headers: {
              "X-User-Role": "admin"
            }
          });
          const text = await res.text();
          const data = JSON.parse(text);
          if (res.ok && data.success) {
            showCustomAlert("สำเร็จ", "ลบผู้ใช้สำเร็จ!", "success");
            fetchUsers();
            onRefreshData();
          } else {
            showCustomAlert("ลบไม่สำเร็จ", data.error || "ลบผู้ใช้ไม่สำเร็จ", "error");
          }
        } catch (err) {
          console.error(err);
          showCustomAlert("เกิดข้อผิดพลาด", "เครือข่ายขัดข้อง", "error");
        }
      }
    });
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEditing = !!editingUserId;
      const url = isEditing ? `/api/users/${editingUserId}` : `/api/users/register`;
      const method = isEditing ? "PUT" : "POST";

      const bodyData = isEditing ? {
        username: userForm.username,
        email: userForm.email,
        password: userForm.password,
        role: userForm.role,
        balance: Number(userForm.balance)
      } : {
        username: userForm.username,
        email: userForm.email,
        password: userForm.password
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "X-User-Role": "admin"
        },
        body: JSON.stringify(bodyData)
      });

      const text = await res.text();
      const data = JSON.parse(text);
      if (res.ok) {
        alert(isEditing ? "ปรับปรุงข้อมูลสมาชิกสำเร็จแล้ว!" : "เพิ่มสมาชิกลงคลังสำเร็จ!");
        setShowUserForm(false);
        setEditingUserId(null);
        setUserForm({ username: "", email: "", password: "", role: "user", balance: 0 });
        fetchUsers();
        onRefreshData();
      } else {
        alert(data.error || "เกิดข้อผิดพลาดในการปรับสถานะสมาชิก");
      }
    } catch (err) {
      console.error(err);
      alert("เครือข่ายขัดข้อง");
    }
  };

  const handleStartEditUser = (u: User) => {
    setEditingUserId(u.id);
    setUserForm({
      username: u.username,
      email: u.email,
      password: u.password || "123456",
      role: u.role,
      balance: u.balance
    });
    setShowUserForm(true);
  };

  const fetchTransactions = async () => {
    setTxLoading(true);
    try {
      const res = await fetch("/api/transactions", {
        headers: { "x-user-id": user?.id || "", "x-user-role": user?.role || "" }
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTxLoading(false);
    }
  };

  const handleUpdateTrackingSubmit = async (txId: string) => {
    try {
      const res = await fetch(`/api/transactions/${txId}/tracking`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id || "",
          "x-user-role": user?.role || ""
        },
        body: JSON.stringify(trackingForm)
      });
      if (res.ok) {
        alert("อัปเดตข้อมูลขนส่งพัสดุเรียบร้อยแล้วค่ะ!");
        setUpdatingTxId(null);
        fetchTransactions();
      } else {
        const data = await res.json();
        alert(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (err) {
      console.error(err);
      alert("เครือข่ายขัดข้อง");
    }
  };

  useEffect(() => {
    if (activeTab === "dashboard") {
      fetchDashStats();
    } else if (activeTab === "php-exporter") {
      fetchPHPScripts();
    } else if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "orders") {
      fetchTransactions();
    } else if (activeTab === "seller-verifications") {
      fetchVerifications();
    } else if (activeTab === "admin-withdrawals") {
      fetchAdminWithdrawals();
    }
  }, [activeTab]);

  const handleUpdateSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onUpdateSettings(editedSettings);
      alert("บันทึกการตั้งค่าร้านค้าเสร็จสมบูรณ์!");
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  const handleDownloadBackup = async () => {
    setBackupLoading(true);
    setBackupErrorMsg("");
    setBackupSuccessMsg("");
    try {
      const res = await fetch("/api/admin/backup", {
        headers: {
          "X-User-Role": "admin"
        }
      });
      if (!res.ok) throw new Error("ไม่สามารถเรียกขอข้อมูลสำรองจากเซิร์ฟเวอร์");
      const dbData = await res.json();
      
      // Create local file download
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(dbData, null, 2)
      )}`;
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", jsonString);
      const filename = `premium_shop_backup_${new Date().toISOString().slice(0,10)}.json`;
      downloadAnchor.setAttribute("download", filename);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      
      setBackupSuccessMsg("ดาวน์โหลดไฟล์สำรองข้อมูลสำเร็จ!");
    } catch (err: any) {
      setBackupErrorMsg("เกิดข้อผิดพลาด: " + err.message);
    } finally {
      setBackupLoading(false);
    }
  };

  const handleUploadBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBackupLoading(true);
    setBackupErrorMsg("");
    setBackupSuccessMsg("");

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const content = event.target?.result as string;
          const backupData = JSON.parse(content);

          // Quick schema validation
          if (!backupData.settings || !backupData.products || !backupData.categories) {
            setBackupErrorMsg("โครงสร้างไฟล์สำรองไม่ถูกต้อง (ต้องมีฟิลด์ settings, products และ categories)");
            setBackupLoading(false);
            return;
          }

          const res = await fetch("/api/admin/restore", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-User-Role": "admin"
            },
            body: JSON.stringify(backupData)
          });
          const text = await res.text();
          let data: any = {};
          try { data = JSON.parse(text); } catch(pe) {}

          if (res.ok) {
            setBackupSuccessMsg("กู้คืนข้อมูลระบบทั้งหมดสำเร็จเรียบร้อยแล้ว!");
            onRefreshData();
            setTimeout(() => {
              alert("กู้คืนระบบทั้งหมดสำเร็จ! กำลังรีเฟรชหน้าต่างร้านค้า...");
              window.location.reload();
            }, 1000);
          } else {
            setBackupErrorMsg(data.error || "เซิร์ฟเวอร์ปฏิเสธการกู้คืนข้อมูล");
          }
        } catch (parseErr: any) {
          setBackupErrorMsg("ไฟล์ JSON ไม่ถูกต้อง หรือไม่สมบูรณ์: " + parseErr.message);
        } finally {
          setBackupLoading(false);
        }
      };
      reader.readAsText(file);
    } catch (err: any) {
      setBackupErrorMsg("เกิดข้อผิดพลาดในการอ่านไฟล์: " + err.message);
      setBackupLoading(false);
    }
  };

  // Portfolio actions handlers
  const handlePortfolioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let updatedPortfolios = [...(editedSettings.portfolios || [])];
      if (editingPortfolioId) {
        // Edit existing
        updatedPortfolios = updatedPortfolios.map(p => 
          p.id === editingPortfolioId ? { ...p, ...portfolioForm } : p
        );
      } else {
        // Add new
        const newPort = {
          id: `port-${Date.now()}`,
          ...portfolioForm
        };
        updatedPortfolios.push(newPort);
      }
      
      const newSettings = { ...editedSettings, portfolios: updatedPortfolios };
      setEditedSettings(newSettings);
      await onUpdateSettings(newSettings);
      
      // Reset form
      setPortfolioForm({ title: "", description: "", imageUrl: "" });
      setEditingPortfolioId(null);
      setShowPortfolioForm(false);
      alert("บันทึกแฟ้มผลงานเรียบร้อยแล้วค่ะ!");
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการบันทึกผลงาน");
    }
  };

  const handleDeletePortfolio = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "ยืนยันการลบผลงาน",
      message: "คุณต้องการลบผลงานนี้ออกจากประวัติร้านค้าใช่หรือไม่?",
      onConfirm: async () => {
        try {
          const updatedPortfolios = (editedSettings.portfolios || []).filter(p => p.id !== id);
          const newSettings = { ...editedSettings, portfolios: updatedPortfolios };
          setEditedSettings(newSettings);
          await onUpdateSettings(newSettings);
          showCustomAlert("สำเร็จ", "ลบผลงานเรียบร้อยแล้วค่ะ!", "success");
        } catch (err) {
          showCustomAlert("เกิดข้อผิดพลาด", "เกิดข้อผิดพลาดในการลบผลงาน", "error");
        }
      }
    });
  };

  // Artisan actions handlers
  const handleArtisanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let updatedArtisans = [...(editedSettings.artisans || [])];
      if (editingArtisanId) {
        // Edit existing
        updatedArtisans = updatedArtisans.map(a => 
          a.id === editingArtisanId ? { ...a, ...artisanForm } : a
        );
      } else {
        // Add new
        const newArt = {
          id: `art-${Date.now()}`,
          ...artisanForm
        };
        updatedArtisans.push(newArt);
      }
      
      const newSettings = { ...editedSettings, artisans: updatedArtisans };
      setEditedSettings(newSettings);
      await onUpdateSettings(newSettings);
      
      // Reset form
      setArtisanForm({ name: "", expertise: "", bio: "", imageUrl: "" });
      setEditingArtisanId(null);
      setShowArtisanForm(false);
      alert("บันทึกข้อมูลช่างฝีมือเรียบร้อยแล้วค่ะ!");
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูลช่างฝีมือ");
    }
  };

  const handleDeleteArtisan = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "ยืนยันการลบข้อมูลช่างฝีมือ",
      message: "คุณต้องการลบข้อมูลช่างฝีมือท่านนี้ใช่หรือไม่?",
      onConfirm: async () => {
        try {
          const updatedArtisans = (editedSettings.artisans || []).filter(a => a.id !== id);
          const newSettings = { ...editedSettings, artisans: updatedArtisans };
          setEditedSettings(newSettings);
          await onUpdateSettings(newSettings);
          showCustomAlert("สำเร็จ", "ลบช่างฝีมือเรียบร้อยแล้วค่ะ!", "success");
        } catch (err) {
          showCustomAlert("เกิดข้อผิดพลาด", "เกิดข้อผิดพลาดในการลบช่างฝีมือ", "error");
        }
      }
    });
  };

  // Landmark/Map action handlers
  const handleLandmarkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let updatedLandmarks = [...(editedSettings.landmarks || [])];
      if (editingLandmarkId) {
        // Edit existing
        updatedLandmarks = updatedLandmarks.map(l => 
          l.id === editingLandmarkId ? { ...l, ...landmarkForm } : l
        );
      } else {
        // Add new
        const newLandmark = {
          id: `loc-${Date.now()}`,
          ...landmarkForm
        };
        updatedLandmarks.push(newLandmark);
      }
      
      const newSettings = { ...editedSettings, landmarks: updatedLandmarks };
      setEditedSettings(newSettings);
      await onUpdateSettings(newSettings);
      
      // Reset form
      setLandmarkForm({ name: "", type: "craft", lat: 7.0518, lng: 100.5285, description: "", phone: "", imageUrl: "" });
      setEditingLandmarkId(null);
      setShowLandmarkForm(false);
      showCustomAlert("สำเร็จ", "บันทึกข้อมูลพิกัดสถานที่เรียบร้อยแล้วค่ะ!", "success");
    } catch (err) {
      showCustomAlert("เกิดข้อผิดพลาด", "เกิดข้อผิดพลาดในการบันทึกข้อมูลพิกัดสถานที่", "error");
    }
  };

  const handleDeleteLandmark = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "ยืนยันการลบลำดับพิกัดสถานที่",
      message: "คุณต้องการลบข้อมูลสถานที่แนะนำทางวัฒนธรรมแห่งนี้ออกจากแผนที่ใช่หรือไม่?",
      onConfirm: async () => {
        try {
          const updatedLandmarks = (editedSettings.landmarks || []).filter(l => l.id !== id);
          const newSettings = { ...editedSettings, landmarks: updatedLandmarks };
          setEditedSettings(newSettings);
          await onUpdateSettings(newSettings);
          showCustomAlert("สำเร็จ", "ลบพิกัดสถานที่เรียบร้อยแล้วค่ะ!", "success");
        } catch (err) {
          showCustomAlert("เกิดข้อผิดพลาด", "เกิดข้อผิดพลาดในการลบพิกัดสถานที่", "error");
        }
      }
    });
  };

  // Product actions handler
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const stockArr = productForm.stockText.split("\n").map(l => l.trim()).filter(Boolean);
    const boxItemsArr = productForm.type === 'box' ? [
      { id: "box-i1-sim", name: "เกลือแสนหวาน (บัตรปลอบใจ 1 THB)", rate: 50, isJackpot: false, accountData: "SALT-REDEEMS" },
      { id: "box-i2-sim", name: "คีย์เครดิตร้าน 10 THB", rate: 30, isJackpot: false, accountData: "RECOVER-CREDIT" },
      { id: "box-i3-sim", name: "ไอดีเกมแบบแรร์พรีเมียม", rate: 20, isJackpot: true, accountData: "JACKPOT-ACC-9821" }
    ] : [];

    const body = {
      ...productForm,
      stock: stockArr,
      boxItems: boxItemsArr
    };

    const method = editingProductId ? "PUT" : "POST";
    const url = editingProductId ? `/api/products/${editingProductId}` : "/api/products";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-User-Role": "admin"
      },
      body: JSON.stringify(body)
    });

    if (res.ok) {
      alert(editingProductId ? "แก้ไขข้อมูลสินค้าสำเร็จ!" : "สร้างสินค้าสำเร็จ!");
      setShowProductForm(false);
      setEditingProductId(null);
      onRefreshData();
    }
  };

  const deleteProduct = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "ยืนยันการลบสินค้า",
      message: "คุณแน่ใจหรือไม่ที่จะลบสินค้าชิ้นนี้ออกจากระบบ?",
      onConfirm: async () => {
        const res = await fetch(`/api/products/${id}`, {
          method: "DELETE",
          headers: { "X-User-Role": "admin" }
        });
        if (res.ok) {
          showCustomAlert("สำเร็จ", "ลบสินค้าเรียบร้อยแล้วค่ะ!", "success");
          onRefreshData();
        } else {
          showCustomAlert("เกิดข้อผิดพลาด", "ไม่สามารถลบสินค้าได้ในขณะนี้", "error");
        }
      }
    });
  };

  // Category actions handler
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingCategoryId ? "PUT" : "POST";
    const url = editingCategoryId ? `/api/categories/${editingCategoryId}` : "/api/categories";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-User-Role": "admin"
      },
      body: JSON.stringify(categoryForm)
    });

    if (res.ok) {
      showCustomAlert("สำเร็จ", editingCategoryId ? "แก้ไขข้อมูลหมวดหมู่สำเร็จ!" : "สร้างหมดหมู่สำเร็จ!", "success");
      setShowCategoryForm(false);
      setEditingCategoryId(null);
      onRefreshData();
    }
  };

  const deleteCategory = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "ยืนยันการลบหมวดหมู่",
      message: "คุณแน่ใจที่จะลบหมวดหมู่สินค้านี้ใช่หรือไม่? สินค้าในหมวดหมู่นี้จะไม่มีหมวดหมู่ระบุ",
      onConfirm: async () => {
        const res = await fetch(`/api/categories/${id}`, {
          method: "DELETE",
          headers: { "X-User-Role": "admin" }
        });
        if (res.ok) {
          showCustomAlert("สำเร็จ", "ลบหมวดหมู่เรียบร้อยแล้วค่ะ!", "success");
          onRefreshData();
        } else {
          showCustomAlert("เกิดข้อผิดพลาด", "ไม่สามารถลบหมวดหมู่ได้ในขณะนี้", "error");
        }
      }
    });
  };

  // Coupon actions handler
  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/coupons", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Role": "admin"
      },
      body: JSON.stringify(couponForm)
    });

    if (res.ok) {
      showCustomAlert("สำเร็จ", "เพิ่มคูปองส่วนลดสำเร็จ!", "success");
      setShowCouponForm(false);
      setCouponForm({ code: "", discountPercent: 0, discountBaht: 0, usesLeft: 10 });
      onRefreshData();
    }
  };

  const deleteCoupon = (code: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "ยืนยันการลบคูปองส่วนลด",
      message: `คุณแน่ใจหรือไม่ที่จะลบส่วนลดโค้ด [${code}]?`,
      onConfirm: async () => {
        const res = await fetch(`/api/coupons/${code}`, {
          method: "DELETE",
          headers: { "X-User-Role": "admin" }
        });
        if (res.ok) {
          showCustomAlert("สำเร็จ", "ลบคูปองส่วนลดเรียบร้อยแล้วค่ะ!", "success");
          onRefreshData();
        } else {
          showCustomAlert("เกิดข้อผิดพลาด", "ไม่สามารถลบคูปองส่วนลดได้ในขณะนี้", "error");
        }
      }
    });
  };

  const handleCopyCode = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedFileIndex(index);
    setTimeout(() => setCopiedFileIndex(null), 2000);
  };

  const getPrimaryPreset = (color: string) => {
    if (!color) return "amber";
    const c = color.toLowerCase();
    if (c.startsWith("#")) {
      if (c === "#8e6d4e" || c === "amber") return "amber";
      if (c === "#ef4444" || c === "crimson") return "crimson";
      if (c === "#06b6d4" || c === "cyan") return "cyan";
      if (c === "#6366f1" || c === "indigo") return "indigo";
      if (c === "#10b981" || c === "emerald") return "emerald";
      if (c === "#f43f5e" || c === "rose") return "rose";
      if (c === "#f97316" || c === "orange") return "orange";
      if (c === "#8b5cf6" || c === "violet") return "violet";
      return "custom";
    }
    return c;
  };

  const preset = getPrimaryPreset(settings.primaryColor);

  const activeColor = 
    preset === 'crimson' ? 'text-red-500' : 
    preset === 'cyan' ? 'text-cyan-400' : 
    preset === 'indigo' ? 'text-indigo-400' :
    preset === 'emerald' ? 'text-emerald-400' :
    preset === 'rose' ? 'text-rose-400' :
    preset === 'orange' ? 'text-orange-400' :
    preset === 'violet' ? 'text-violet-400' :
    preset === 'custom' ? 'text-[var(--custom-accent)]' :
    'text-[#8E6D4E]';

  const themeAccentBorder = 
    preset === 'crimson' ? 'border-red-500' : 
    preset === 'cyan' ? 'border-cyan-400' : 
    preset === 'indigo' ? 'border-indigo-500' :
    preset === 'emerald' ? 'border-emerald-500' :
    preset === 'rose' ? 'border-rose-500' :
    preset === 'orange' ? 'border-orange-500' :
    preset === 'violet' ? 'border-violet-500' :
    preset === 'custom' ? 'border-[var(--custom-accent)]' :
    'border-[#8E6D4E]';

  const themeAccentBg = 
    preset === 'crimson' ? 'bg-red-500/10 text-red-400' : 
    preset === 'cyan' ? 'bg-cyan-500/10 text-cyan-400' : 
    preset === 'indigo' ? 'bg-indigo-500/10 text-indigo-400' :
    preset === 'emerald' ? 'bg-emerald-500/10 text-emerald-400' :
    preset === 'rose' ? 'bg-rose-500/10 text-rose-400' :
    preset === 'orange' ? 'bg-orange-500/10 text-orange-400' :
    preset === 'violet' ? 'bg-violet-500/10 text-violet-400' :
    preset === 'custom' ? 'bg-[var(--custom-accent-bg)] text-[var(--custom-accent)]' :
    'bg-[#8E6D4E]/10 text-[#8E6D4E]';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 overflow-y-auto backdrop-blur-md"
      style={{
        "--custom-accent": settings.primaryColor?.startsWith("#") ? settings.primaryColor : "#8E6D4E",
        "--custom-accent-bg": settings.primaryColor?.startsWith("#") ? `${settings.primaryColor}18` : "rgba(142, 109, 78, 0.1)"
      } as React.CSSProperties}
    >
      <div className="relative w-full max-w-6xl rounded-3xl bg-[#16161A] border border-white/10 p-4 sm:p-7 shadow-2xl z-10 flex flex-col max-h-[96vh] h-[92vh] md:h-[90vh]">
        
        {/* Head Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <LayoutDashboard size={18} className="text-amber-500" />
            <h2 className="text-base font-black text-white">ระบบควบคุมหลังบ้าน (Executive Administrator CRM)</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Dynamic Split Frame: Left Sidebar Tabs / Right Details Workspace */}
        <div className="flex flex-col md:grid md:grid-cols-12 gap-5 pt-4 flex-1 min-h-0 overflow-hidden">
          
          {/* LEFT Sidebar controls */}
          <div className="flex-shrink-0 md:col-span-3 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible pb-2.5 md:pb-0 border-b md:border-b-0 md:border-r border-white/5 pr-0 md:pr-4 scrollbar-thin">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex-shrink-0 md:w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold rounded-xl transition-all text-left whitespace-nowrap cursor-pointer ${
                activeTab === "dashboard" ? `${themeAccentBg} border-r-2 ${themeAccentBorder}` : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <LayoutDashboard size={14} />
              <span>ภาพรวมสถิติ</span>
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`flex-shrink-0 md:w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold rounded-xl transition-all text-left whitespace-nowrap cursor-pointer ${
                activeTab === "products" ? `${themeAccentBg} border-r-2 ${themeAccentBorder}` : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Database size={14} />
              <span>จัดการสินค้าและหุ้น</span>
            </button>
            <button
              onClick={() => setActiveTab("categories")}
              className={`flex-shrink-0 md:w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold rounded-xl transition-all text-left whitespace-nowrap cursor-pointer ${
                activeTab === "categories" ? `${themeAccentBg} border-r-2 ${themeAccentBorder}` : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <FolderHeart size={14} />
              <span>จัดการหมวดหมู่</span>
            </button>
            <button
              onClick={() => setActiveTab("coupons")}
              className={`flex-shrink-0 md:w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold rounded-xl transition-all text-left whitespace-nowrap cursor-pointer ${
                activeTab === "coupons" ? `${themeAccentBg} border-r-2 ${themeAccentBorder}` : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Ticket size={14} />
              <span>จัดการคูปองโค้ด</span>
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`flex-shrink-0 md:w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold rounded-xl transition-all text-left whitespace-nowrap cursor-pointer ${
                activeTab === "users" ? `${themeAccentBg} border-r-2 ${themeAccentBorder}` : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Users size={14} />
              <span>จัดการผู้ใช้และเครดิต</span>
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex-shrink-0 md:w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold rounded-xl transition-all text-left whitespace-nowrap cursor-pointer ${
                activeTab === "orders" ? `${themeAccentBg} border-r-2 ${themeAccentBorder}` : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Truck size={14} />
              <span>จัดการออเดอร์และขนส่ง</span>
            </button>
            <button
              onClick={() => setActiveTab("about-us")}
              className={`flex-shrink-0 md:w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold rounded-xl transition-all text-left whitespace-nowrap cursor-pointer ${
                activeTab === "about-us" ? `${themeAccentBg} border-r-2 ${themeAccentBorder}` : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Info size={14} />
              <span>ตั้งค่าเกี่ยวกับเรา</span>
            </button>
            <button
              onClick={() => setActiveTab("portfolios")}
              className={`flex-shrink-0 md:w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold rounded-xl transition-all text-left whitespace-nowrap cursor-pointer ${
                activeTab === "portfolios" ? `${themeAccentBg} border-r-2 ${themeAccentBorder}` : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Palette size={14} />
              <span>จัดการแฟ้มผลงาน</span>
            </button>
            <button
              onClick={() => setActiveTab("artisans")}
              className={`flex-shrink-0 md:w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold rounded-xl transition-all text-left whitespace-nowrap cursor-pointer ${
                activeTab === "artisans" ? `${themeAccentBg} border-r-2 ${themeAccentBorder}` : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Award size={14} />
              <span>จัดการช่างฝีมือ</span>
            </button>
            <button
              onClick={() => setActiveTab("landmarks")}
              className={`flex-shrink-0 md:w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold rounded-xl transition-all text-left whitespace-nowrap cursor-pointer ${
                activeTab === "landmarks" ? `${themeAccentBg} border-r-2 ${themeAccentBorder}` : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <MapIcon size={14} className={activeTab === "landmarks" ? "text-amber-500" : "text-slate-400"} />
              <span>จัดการแผนที่แนะนำ</span>
            </button>
            <button
              onClick={() => setActiveTab("seller-verifications")}
              className={`flex-shrink-0 md:w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold rounded-xl transition-all text-left whitespace-nowrap cursor-pointer ${
                activeTab === "seller-verifications" ? `${themeAccentBg} border-r-2 ${themeAccentBorder}` : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Users size={14} className="text-teal-400" />
              <span>อนุมัติผู้สมัคร KYC</span>
            </button>
            <button
              onClick={() => setActiveTab("admin-withdrawals")}
              className={`flex-shrink-0 md:w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold rounded-xl transition-all text-left whitespace-nowrap cursor-pointer ${
                activeTab === "admin-withdrawals" ? `${themeAccentBg} border-r-2 ${themeAccentBorder}` : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Gift size={14} className="text-emerald-400" />
              <span>อนุมัติการถอนเงิน</span>
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`flex-shrink-0 md:w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold rounded-xl transition-all text-left whitespace-nowrap cursor-pointer ${
                activeTab === "settings" ? `${themeAccentBg} border-r-2 ${themeAccentBorder}` : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Settings size={14} />
              <span>ตั้งค่าเว็บไซต์ร้าน</span>
            </button>
            <button
              onClick={() => setActiveTab("php-exporter")}
              className={`flex-shrink-0 md:w-full flex items-center gap-2.5 px-3 py-2.5 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all text-left whitespace-nowrap cursor-pointer bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border border-teal-500/20 text-teal-400 hover:from-teal-500/20 hover:to-emerald-500/20 ${
                activeTab === "php-exporter" ? "ring-1 ring-teal-400" : ""
              }`}
              title="ส่งออกไฟล์ PHP (PDO) เพื่อดาวน์โหลดนำไปเปิดใช้งานร้านจริงได้ทันที"
            >
              <Code size={14} className="text-emerald-400" />
              <span>ดาวน์โหลดโค้ด PHP (PDO)</span>
            </button>
          </div>

          {/* RIGHT Workspace Details */}
          <div className="flex-1 min-h-0 md:col-span-9 overflow-y-auto pr-1 flex flex-col h-full pb-4">
            
            {/* T1: Statistics Dashboard */}
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                <span className="text-xs text-slate-500 font-semibold block">สถิติความเคลื่อนไหว (ยอดขาย & ธุรกรรมของลูกค้าร้าน)</span>
                {loading ? (
                  <p className="text-xs text-slate-400 py-10 text-center animate-pulse">กำลังสถิติความเคลื่อนไหว...</p>
                ) : (
                  <>
                    {/* Revenue blocks grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-slate-950 border border-white/5 space-y-1">
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-blue-400">รายได้รวมทั้งหมด</span>
                        <h3 className="text-2xl font-black text-white">{(stats?.revenue?.total || 0).toLocaleString()} ฿</h3>
                        <p className="text-[9px] text-slate-400">มาจากการโอนผ่านบัญชีธนาคาร (เช็คผ่าน API สลิปอัตโนมัติสำเร็จ)</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-950 border border-white/5 space-y-1">
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-cyan-400">รายได้ผ่านการโอนบัญชีธนาคาร (QR)</span>
                        <h3 className="text-2xl font-black text-white">{(stats?.revenue?.qr || 0).toLocaleString()} ฿</h3>
                        <p className="text-[9px] text-slate-400">เช็คผ่าน API สลิปอัตโนมัติสำเร็จ</p>
                      </div>
                    </div>

                    {/* Quantity badges */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 bg-slate-950/50 rounded-xl border border-white/5 text-center">
                        <span className="text-[9px] text-slate-500 font-bold block uppercase">สมาชิกทั้งหมด</span>
                        <span className="text-lg font-black text-white">{stats?.counts?.users} Account</span>
                      </div>
                      <div className="p-3 bg-slate-950/50 rounded-xl border border-white/5 text-center">
                        <span className="text-[9px] text-slate-500 font-bold block uppercase">ชิ้นประเภทสินค้า</span>
                        <span className="text-lg font-black text-white">{stats?.counts?.products} ชิ้น</span>
                      </div>
                      <div className="p-3 bg-slate-950/50 rounded-xl border border-white/5 text-center">
                        <span className="text-[9px] text-slate-500 font-bold block uppercase">จำนวนที่ขายไป</span>
                        <span className="text-lg font-black text-white">{stats?.counts?.itemsSold} ครั้ง</span>
                      </div>
                      <div className="p-3 bg-slate-950/50 rounded-xl border border-white/5 text-center">
                        <span className="text-[9px] text-slate-500 font-bold block uppercase">รีวิวจากผู้ใช้</span>
                        <span className="text-lg font-black text-white">{stats?.counts?.reviews} รีวิว</span>
                      </div>
                    </div>

                    {/* Developer Note */}
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl leading-relaxed text-xs">
                      ⚡ <strong>ระบบร้านค้าพร้อมคลังพรีเมียมทำงานสำเร็จรูป:</strong> ข้อมูลสถิติของร้านค้าทั้งหมด (จำนวนผู้ดูแล, ยอดถอนเงินสด, สลิปสแกน QR, สต็อก) จัดการและเก็บข้อมูลง่ายดายบนความจำระบบเซิร์ฟเวอร์แบบ persistence สะท้อนสถิติตามจริงได้ทันที ณ ทุกการซื้อ/สุ่มในระบบ!
                    </div>
                  </>
                )}
              </div>
            )}

            {/* T2: Products Management CRUD inside dashboard workspace */}
            {activeTab === "products" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-semibold">รายการกล่องสุ่มสินค้า & คลังสต็อกไอดี</span>
                  <button
                    onClick={() => {
                      setEditingProductId(null);
                      setProductForm({
                        name: "", categoryId: categories[0]?.id || "", price: 150, imageUrl: "", description: "", details: "", videoUrl: "", stockText: "", type: "normal", boxItemsText: ""
                      });
                      setShowProductForm(!showProductForm);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold text-slate-950 flex items-center gap-1 cursor-pointer hover:opacity-90 bg-amber-400`}
                  >
                    <Plus size={13} />
                    <span>เพิ่มสินค้า/กล่องสุ่ม</span>
                  </button>
                </div>

                {/* Form view */}
                {showProductForm && (
                  <form onSubmit={handleProductSubmit} className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-3.5 text-xs text-slate-200">
                    <h3 className="font-extrabold text-white">{editingProductId ? "แก้ไขสินค้า" : "สร้างสินค้าคลังตัวใหม่"}</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block mb-1 text-[10px] text-slate-400">ชื่อสินค้าขาย *</label>
                        <input type="text" required value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white" />
                      </div>
                      <div>
                        <label className="block mb-1 text-[10px] text-slate-400">หมวดหมู่สินค้า *</label>
                        <select value={productForm.categoryId} onChange={e => setProductForm({...productForm, categoryId: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white">
                          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block mb-1 text-[10px] text-slate-400">ราคาจำหน่าย (บาท) *</label>
                        <input type="number" required min="0" value={productForm.price} onChange={e => setProductForm({...productForm, price: Number(e.target.value)})} className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white" />
                      </div>
                      <div>
                        <label className="block mb-1 text-[10px] text-slate-400">ประเภทระบุคลัง *</label>
                        <select value={productForm.type} onChange={e => setProductForm({...productForm, type: e.target.value as any})} className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white">
                          <option value="normal">สต็อกไอดี/คีย์ปกติ (Digital Keys/Credentials)</option>
                          <option value="box">กล่องสุ่มนำโชค (Gacha Surprise Box)</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <ImageUploader 
                          label="รูปภาพหน้าปกสินค้า (Image URL) *"
                          value={productForm.imageUrl}
                          onChange={url => setProductForm({...productForm, imageUrl: url})}
                          placeholder="ใส่ลิงก์รูปภาพ หรือกดปุ่มแนบรูปเพื่ออัปโหลด..."
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block mb-1 text-[10px] text-slate-400">คำโปรยอธิบายแบบสั้น *</label>
                        <input type="text" required value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white" />
                      </div>
                      <div className="col-span-2">
                        <label className="block mb-1 text-[10px] text-slate-400">รายละเอียดขยายความข้อมูลจำเพาะ (Specs Markdown)</label>
                        <textarea rows={3} value={productForm.details} onChange={e => setProductForm({...productForm, details: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white" placeholder="พิมพ์ฟีเจอร์เด่นๆ ของสินค้า" />
                      </div>
                      <div className="col-span-2">
                        <label className="block mb-1 text-[10px] text-slate-400">ลิงก์วิดีโอรีวิวจาก YouTube (YouTube Review URL)</label>
                        <input type="url" value={productForm.videoUrl} onChange={e => setProductForm({...productForm, videoUrl: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white" placeholder="เช่น https://www.youtube.com/watch?v=xxxxxx หรือ https://youtu.be/xxxxxx" />
                      </div>

                      {/* Stock keys list */}
                      <div className="col-span-2">
                        <label className="block mb-1 text-[10px] text-slate-400">
                          {productForm.type === 'normal' 
                            ? "กรอกคีย์สต๊อกสินค้า (1 บรรทัด = 1 รหัสไอดีสำหรับการซื้อ 1 ครั้ง)" 
                            : "รหัสคูปองรางวัลกล่องสุ่มจำลอง (1 แถวต่อกล่องสุ่ม มีการจำลองจำแนกอัตรายูนิคออก)"
                          }
                        </label>
                        <textarea rows={3} value={productForm.stockText} onChange={e => setProductForm({...productForm, stockText: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 font-mono text-[11px] text-teal-400" placeholder="KEY-12345-VALID&#13;KEY-54321-VALID" />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button type="button" onClick={() => setShowProductForm(false)} className="bg-slate-800 text-slate-300 py-1.5 px-3 rounded-lg hover:bg-slate-700">ยกเลิก</button>
                      <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-1.5 px-4 rounded-lg">บันทึกสินค้า</button>
                    </div>
                  </form>
                )}

                {/* Table list */}
                <div className="overflow-x-auto rounded-2xl border border-white/5">
                  <table className="w-full text-left border-collapse text-xs text-slate-300">
                    <thead className="bg-slate-950 font-extrabold text-[#ffffff]">
                      <tr>
                        <th className="p-3">สินค้า</th>
                        <th className="p-3">ประเภท</th>
                        <th className="p-3">ราคา</th>
                        <th className="p-3">คลังสต็อกคงเหลือ</th>
                        <th className="p-3">ยอดขายสะสม</th>
                        <th className="p-3 text-center">การจัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 bg-slate-900/10">
                      {products.map(p => (
                        <tr key={p.id}>
                          <td className="p-3 font-semibold">{p.name}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.type === 'box' ? 'bg-purple-500/10 text-purple-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                              {p.type === 'box' ? 'Lucky Box' : 'Digital Key'}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-red-400">{p.price} ฿</td>
                          <td className="p-3 font-mono font-bold text-teal-400">{p.stock.length} ชิ้น</td>
                          <td className="p-3 font-semibold">{p.timesSold} ชิ้น</td>
                          <td className="p-3 flex items-center justify-center gap-1">
                            <button
                              onClick={() => {
                                setEditingProductId(p.id);
                                setProductForm({
                                  name: p.name, categoryId: p.categoryId, price: p.price, imageUrl: p.imageUrl, description: p.description, details: p.details, videoUrl: p.videoUrl || "", stockText: p.stock.join("\n"), type: p.type, boxItemsText: ""
                                });
                                setShowProductForm(true);
                              }}
                              className="p-1 rounded bg-slate-800 text-slate-200 hover:text-white"
                            >
                              <Edit size={13} />
                            </button>
                            <button onClick={() => deleteProduct(p.id)} className="p-1 rounded bg-red-950 text-red-400 hover:text-red-300">
                              <Trash size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* T3: Categories Management */}
            {activeTab === "categories" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-semibold">หมวดหมู่ชั้นนำของร้านค้า</span>
                  <button
                    onClick={() => {
                      setEditingCategoryId(null);
                      setCategoryForm({ name: "", description: "", icon: "Folder", imageUrl: "" });
                      setShowCategoryForm(!showCategoryForm);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-950 flex items-center gap-1 bg-amber-400"
                  >
                    <Plus size={13} />
                    <span>เพิ่มหมวดหมู่ใหม่</span>
                  </button>
                </div>

                {/* Form view */}
                {showCategoryForm && (
                  <form onSubmit={handleCategorySubmit} className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-3.5 text-xs text-slate-200">
                    <h3 className="font-extrabold text-white">{editingCategoryId ? "แก้ไขหมวดหมู่" : "สร้างหมวดหมู่ใหม่"}</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block mb-1 text-[10px] text-slate-400">ชื่อหมวดหมู่แนะนำ *</label>
                        <input type="text" required value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white" />
                      </div>
                      <div>
                        <label className="block mb-1 text-[10px] text-slate-400">ชื่อไอคอนตกแต่ง (Lucide Name) *</label>
                        <select value={categoryForm.icon} onChange={e => setCategoryForm({...categoryForm, icon: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white">
                          <option value="Folder">Folder (แฟ้มเอกสาร)</option>
                          <option value="Gamepad2">Gamepad2 (คอยล์จอยสติ๊ก)</option>
                          <option value="TrendingUp">TrendingUp (ลูกศรฮิต)</option>
                          <option value="Sparkles">Sparkles (ระยับพร่างวิบวับ)</option>
                          <option value="UserCheck">UserCheck (คนยืนมีโล่)</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <ImageUploader 
                          label="รูปภาพประจำหมวดหมู่ (Category Image - แนะนำรูปภาพสี่เหลี่ยมจัตุรัส)"
                          value={categoryForm.imageUrl || ""}
                          onChange={url => setCategoryForm({...categoryForm, imageUrl: url})}
                          placeholder="เช่น https://domain.com/category-image.png"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block mb-1 text-[10px] text-slate-400">คำอธิบายภาพรวมสั้น</label>
                        <input type="text" value={categoryForm.description} onChange={e => setCategoryForm({...categoryForm, description: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white" />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button type="button" onClick={() => setShowCategoryForm(false)} className="bg-slate-800 text-slate-300 py-1.5 px-3 rounded-lg hover:bg-slate-700">ยกเลิก</button>
                      <button type="submit" className="bg-emerald-500 text-slate-950 font-bold py-1.5 px-4 rounded-lg">บันทึกหมวดหมู่</button>
                    </div>
                  </form>
                )}

                {/* Categories Table list */}
                <div className="overflow-x-auto rounded-2xl border border-white/5">
                  <table className="w-full text-left border-collapse text-xs text-slate-300">
                    <thead className="bg-slate-950 font-extrabold">
                      <tr>
                        <th className="p-3">หมวดหมู่</th>
                        <th className="p-3">ไอคอนประกอบ</th>
                        <th className="p-3">คำอธิบาย</th>
                        <th className="p-3 text-center">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 bg-slate-900/10">
                      {categories.map(cat => (
                        <tr key={cat.id}>
                          <td className="p-3 font-semibold flex items-center gap-2">
                            {cat.imageUrl && (
                              <img src={cat.imageUrl} alt={cat.name} className="w-6 h-6 rounded-lg object-cover border border-white/10" />
                            )}
                            <span>{cat.name}</span>
                          </td>
                          <td className="p-3 flex items-center gap-1">
                            <span className="p-1 rounded bg-slate-800"><LucideIcon name={cat.icon || "Folder"} size={14} /></span>
                            <span>{cat.icon || "Folder"}</span>
                          </td>
                          <td className="p-3 text-slate-400">{cat.description}</td>
                          <td className="p-3 text-center">
                            <div className="flex justify-center gap-1">
                              <button
                                onClick={() => {
                                  setEditingCategoryId(cat.id);
                                  setCategoryForm({ name: cat.name, description: cat.description, icon: cat.icon, imageUrl: cat.imageUrl });
                                  setShowCategoryForm(true);
                                }}
                                className="p-1 rounded bg-slate-800 text-slate-200"
                              >
                                <Edit size={13} />
                              </button>
                              <button onClick={() => deleteCategory(cat.id)} className="p-1 rounded bg-red-950 text-red-500">
                                <Trash size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* T4: Coupon Codes Management */}
            {activeTab === "coupons" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-semibold">บาร์จำกัดคูปองโค้ดส่วนลดของทางเว็ป</span>
                  <button
                    onClick={() => setShowCouponForm(!showCouponForm)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-950 flex items-center gap-1 bg-amber-400"
                  >
                    <Plus size={13} />
                    <span>เพิ่มคูปองใหม่</span>
                  </button>
                </div>

                {/* Form */}
                {showCouponForm && (
                  <form onSubmit={handleCouponSubmit} className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-3 text-xs text-slate-200">
                    <h3 className="font-extrabold text-white">สร้างรหัสส่วนลดใหม่</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block mb-1 text-[10px]">คีย์อักษรรหัสคูปอง (เช่น DISCOUNT15)*</label>
                        <input type="text" required value={couponForm.code} onChange={e => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})} className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white" />
                      </div>
                      <div>
                        <label className="block mb-1 text-[10px]">จำนวนสิทธิ์ใช้งาน (ครั้ง) *</label>
                        <input type="number" required min="1" value={couponForm.usesLeft} onChange={e => setCouponForm({...couponForm, usesLeft: Number(e.target.value)})} className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white" />
                      </div>
                      <div>
                        <label className="block mb-1 text-[10px]">ส่วนลดเปอร์เซ็นต์ (%) ปล่อยว่างถ้าลดเป็นบาท</label>
                        <input type="number" min="0" max="100" value={couponForm.discountPercent} onChange={e => setCouponForm({...couponForm, discountPercent: Number(e.target.value)})} className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white" />
                      </div>
                      <div>
                        <label className="block mb-1 text-[10px]">ส่วนลดเงินสด (บาท) ปล่อยว่างถ้าลดเป็นเปอร์เซ็นต์</label>
                        <input type="number" min="0" value={couponForm.discountBaht} onChange={e => setCouponForm({...couponForm, discountBaht: Number(e.target.value)})} className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white" />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setShowCouponForm(false)} className="bg-slate-800 text-slate-300 py-1.5 px-3 rounded-lg">ยกเลิก</button>
                      <button type="submit" className="bg-emerald-500 text-slate-950 font-bold py-1.5 px-4 rounded-lg">บันทึกส่วนลด</button>
                    </div>
                  </form>
                )}

                {/* Table */}
                <div className="overflow-x-auto rounded-2xl border border-white/5">
                  <table className="w-full text-left border-collapse text-xs text-slate-300">
                    <thead className="bg-slate-950 font-extrabold">
                      <tr>
                        <th className="p-3">โค้ดส่วนลด (Coupon Code)</th>
                        <th className="p-3">ประเภทส่วนลด</th>
                        <th className="p-3">จำนวนสิทธิ์เหลือ</th>
                        <th className="p-3 text-center">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 bg-slate-900/10">
                      {coupons.map(c => (
                        <tr key={c.code}>
                          <td className="p-3 font-mono font-bold text-amber-400">{c.code}</td>
                          <td className="p-3">
                            {c.discountPercent > 0 ? (
                              <span className="text-emerald-400">ลดแรง {c.discountPercent}%</span>
                            ) : (
                              <span className="text-teal-400">ลดสด {c.discountBaht} บาท</span>
                            )}
                          </td>
                          <td className="p-3 font-semibold">{c.usesLeft} ครั้ง</td>
                          <td className="p-3 text-center">
                            <button onClick={() => deleteCoupon(c.code)} className="p-1 rounded bg-red-950 text-red-500 hover:bg-slate-800">
                              <Trash size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            )}

            {/* T4.5: Users & Credit Management */}
            {activeTab === "users" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-semibold">บัญชีผู้ใช้ระบบชุมชนน้ำน้อยทั้งหมด ({usersList.length} ผู้ใช้งาน)</span>
                  <button
                    onClick={() => {
                      setEditingUserId(null);
                      setUserForm({ username: "", email: "", password: "", role: "user", balance: 0 });
                      setShowUserForm(!showUserForm);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-950 flex items-center gap-1 bg-amber-400 cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>เพิ่มสมาชิกใหม่</span>
                  </button>
                </div>

                {/* Create/Edit User Form */}
                {showUserForm && (
                  <form onSubmit={handleUserSubmit} className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-3 text-xs text-slate-200">
                    <h3 className="font-extrabold text-white text-sm">
                      {editingUserId ? `📝 แก้ไขข้อมูลและเครดิตผู้ใช้งาน (ID: ${editingUserId})` : "➕ ลงทะเบียนสมาชิกใหม่เข้าระบบ"}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block mb-1 text-[10px] text-stone-400">ชื่อผู้ใช้ (Username)*</label>
                        <input 
                          type="text" 
                          required 
                          value={userForm.username} 
                          onChange={e => setUserForm({...userForm, username: e.target.value})} 
                          className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white" 
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-[10px] text-stone-400">อีเมล (Email)*</label>
                        <input 
                          type="email" 
                          required 
                          value={userForm.email} 
                          onChange={e => setUserForm({...userForm, email: e.target.value})} 
                          className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white" 
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-[10px] text-stone-400 font-bold text-amber-300">รหัสผ่าน (Password)*</label>
                        <input 
                          type="text" 
                          required 
                          value={userForm.password} 
                          onChange={e => setUserForm({...userForm, password: e.target.value})} 
                          placeholder="รหัสผ่านเข้าสู่ระบบ"
                          className="w-full bg-slate-900 border border-amber-500/30 rounded-lg p-2 text-amber-200 font-mono" 
                        />
                      </div>

                      {/* Role selection -> Only shown when editing or explicitly available */}
                      <div>
                        <label className="block mb-1 text-[10px] text-stone-400">บทบาท (Role)*</label>
                        <select 
                          value={userForm.role} 
                          onChange={e => setUserForm({...userForm, role: e.target.value as "user" | "admin"})}
                          className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white"
                        >
                          <option value="user">User (ผู้ซื้อทั่วไป)</option>
                          <option value="admin">Admin (ผู้ดูแลระบบหลังบ้าน)</option>
                        </select>
                      </div>

                      {/* Balance / Credits input */}
                      <div>
                        <label className="block mb-1 text-[10px] text-stone-400 font-bold text-emerald-400">จำนวนเครดิต / ยอดเงินคงเหลือ (฿)*</label>
                        <input 
                          type="number" 
                          min="0"
                          step="0.01"
                          required
                          value={userForm.balance} 
                          onChange={e => setUserForm({...userForm, balance: Number(e.target.value)})} 
                          className="w-full bg-slate-900 border border-emerald-500/30 rounded-lg p-2 text-emerald-300 font-mono font-bold" 
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button 
                        type="button" 
                        onClick={() => {
                          setShowUserForm(false);
                          setEditingUserId(null);
                        }} 
                        className="bg-slate-850 hover:bg-slate-800 text-slate-300 py-1.5 px-3 rounded-lg cursor-pointer transition-all"
                      >
                        ยกเลิก
                      </button>
                      <button 
                        type="submit" 
                        className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black py-1.5 px-4 rounded-lg cursor-pointer transition-all"
                      >
                        บันทึกข้อมูลและอัปโหลดยอดเงิน
                      </button>
                    </div>
                  </form>
                )}

                {/* Display Users management Table / Grid layout */}
                {userListLoading ? (
                  <div className="py-8 text-center text-xs text-slate-400">กำลังตรวจค้นดึงสารบรรณรายชื่อสมาชิก...</div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-white/5 font-sans">
                    <table className="w-full text-left border-collapse text-xs text-slate-300">
                      <thead className="bg-[#101012] font-black text-[#8E6D4E] uppercase tracking-wider text-[10px] border-b border-white/5">
                        <tr>
                          <th className="p-3">รหัสผู้ใช้ (User ID)</th>
                          <th className="p-3">ผู้ใช้งาน (Username) / อีเมล</th>
                          <th className="p-3">รหัสผ่าน (Password)</th>
                          <th className="p-3 text-center">บทบาท</th>
                          <th className="p-3 text-right">ยอดเครดิตในระบบ</th>
                          <th className="p-3 text-center">การจัดการ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 bg-slate-900/10">
                        {usersList.map(u => (
                          <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="p-3 font-mono text-slate-500 select-all">{u.id}</td>
                            <td className="p-3">
                              <div className="font-extrabold text-white flex items-center gap-1.5">
                                {u.avatarUrl && (
                                  <img src={u.avatarUrl} alt="" className="w-4 h-4 rounded-full" referrerPolicy="no-referrer" />
                                )}
                                <span>{u.username}</span>
                              </div>
                              <span className="text-[10px] text-slate-400 block break-all">{u.email}</span>
                            </td>
                            <td className="p-3">
                              <span className="p-1 font-mono font-bold text-amber-300 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-300/10">
                                {u.password || <span className="text-slate-500 text-[10px] italic">ไม่มี (เข้าด้วย Discord)</span>}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              {u.role === "admin" ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-500/10 text-red-400 border border-red-500/20">ADMIN</span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-855 text-slate-450 border border-slate-700/20">USER</span>
                              )}
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-emerald-400">
                              {u.balance.toFixed(2)} ฿
                            </td>
                            <td className="p-3">
                              <div className="flex items-center justify-center gap-1.5">
                                <button 
                                  onClick={() => handleStartEditUser(u)} 
                                  className="p-1 rounded bg-stone-800 text-amber-400 hover:bg-stone-750 hover:text-amber-300 transition-all cursor-pointer"
                                  title="แก้ไขข้อมูล / ปรับเครดิต"
                                >
                                  <Edit size={13} />
                                </button>
                                <button 
                                  onClick={() => {
                                    const amountStr = prompt(`ต้องการเพิ่ม หรือ หักลด เครดิตสำหรับคุณ ${u.username} ?\nพิมพ์ตัวเลขเชิงบวกเพื่อบวกค่า (เช่น 250) หรือพิมพ์ตัวเลขมีเครื่องหมายลบนำหน้าเพื่อหักออก (เช่น -100)`);
                                    if (amountStr !== null) {
                                      const amount = parseFloat(amountStr);
                                      if (isNaN(amount)) {
                                        alert("รูปแบบตัวเลขไม่ถูกต้อง กรุณาระบุด้วยอักขระตัวเลขที่ถูกต้องค่ะ");
                                      } else {
                                        const newBalance = Math.max(0, u.balance + amount);
                                        fetch(`/api/users/${u.id}`, {
                                          method: "PUT",
                                          headers: {
                                            "Content-Type": "application/json",
                                            "X-User-Role": "admin"
                                          },
                                          body: JSON.stringify({ balance: newBalance })
                                        }).then(res => {
                                          if (res.ok) {
                                            alert(`บันทึกยอดเครดิตปรับใหม่สำเร็จแล้ว ยอดรวมคุ้มค่า: ${newBalance.toFixed(2)} ฿`);
                                            fetchUsers();
                                            onRefreshData();
                                          } else {
                                            alert("เกิดข้อผิดพลาดในการตรวจสอบดุลเงินสด");
                                          }
                                        }).catch(() => alert("ระบบเครือข่ายขัดข้อง"));
                                      }
                                    }
                                  }}
                                  className="px-2 py-1 bg-emerald-950 text-emerald-400 rounded hover:bg-emerald-900/60 font-black text-[10px] border border-emerald-500/20 cursor-pointer"
                                  title="ปรับเงินส่วนลดเพิ่มด่วน"
                                >
                                  ± เพิ่มลดเครดิต
                                </button>
                                <button 
                                  onClick={() => handleDeleteUser(u.id)} 
                                  className="p-1 rounded bg-red-950/40 text-red-500 hover:bg-red-950 transition-all cursor-pointer"
                                  title="ลบผู้ใช้รายนี้ออกจากระบบ"
                                >
                                  <Trash size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* T_about_us: About Us Settings */}
            {activeTab === "about-us" && (
              <form onSubmit={handleUpdateSettingsSubmit} className="space-y-4 text-xs text-slate-300 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-teal-400">📝 ตั้งค่าเกี่ยวกับเรา (About Us Settings)</h3>
                    <p className="text-[10px] text-slate-500">ปรับเปลี่ยนข้อมูลเรื่องราวประวัติและวัตถุประสงค์ของชุมชนที่แสดงบนหน้าแรก</p>
                  </div>
                  <button type="submit" className="bg-gradient-to-r from-teal-500 to-emerald-400 text-slate-950 font-bold py-2 px-5 rounded-lg hover:scale-102 transition-all cursor-pointer">
                    บันทึกข้อมูลเกี่ยวกับเรา
                  </button>
                </div>

                <div className="bg-slate-950/40 p-5 rounded-2xl border border-white/5 space-y-4">
                  <div>
                    <label className="block mb-1 text-[10px] text-slate-400 font-bold">หัวข้อหลักของส่วนเกี่ยวกับเรา *</label>
                    <input 
                      type="text" 
                      required 
                      value={editedSettings.aboutUsTitle || ""} 
                      onChange={e => setEditedSettings({...editedSettings, aboutUsTitle: e.target.value})} 
                      className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-white" 
                      placeholder="เช่น วิถีแห่งภูมิปัญญาท้องถิ่น ชุมชนน้ำน้อย"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-[10px] text-slate-400 font-bold">เนื้อหารายละเอียดเกี่ยวกับเรา *</label>
                    <textarea 
                      required 
                      rows={6}
                      value={editedSettings.aboutUsBody || ""} 
                      onChange={e => setEditedSettings({...editedSettings, aboutUsBody: e.target.value})} 
                      className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-white leading-relaxed font-light" 
                      placeholder="อธิบายประวัติความเป็นมา วัตถุประสงค์ หรือความร่วมมือในชุมชน..."
                    />
                  </div>

                  <div>
                    <ImageUploader 
                      label="รูปภาพประกอบเกี่ยวกับเรา (About Us Image)"
                      value={editedSettings.aboutUsImageUrl || ""}
                      onChange={url => setEditedSettings({...editedSettings, aboutUsImageUrl: url})}
                      placeholder="ใส่ลิงก์รูปภาพ หรือกดอัปโหลดไฟล์..."
                    />
                  </div>
                </div>
              </form>
            )}

            {/* T_portfolios: Portfolio Management */}
            {activeTab === "portfolios" && (
              <div className="space-y-4 text-xs text-slate-300 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-teal-400">🎨 จัดการแฟ้มผลงานศิลปหัตถกรรม (Portfolio Management)</h3>
                    <p className="text-[10px] text-slate-500 font-light">จัดการคอลเลกชันผลงานมาสเตอร์พีซและภูมิปัญญาอันล้ำค่าเพื่อแสดงบนหน้าแรกของสโตร์</p>
                  </div>
                  {!showPortfolioForm && (
                    <button
                      onClick={() => {
                        setPortfolioForm({ title: "", description: "", imageUrl: "" });
                        setEditingPortfolioId(null);
                        setShowPortfolioForm(true);
                      }}
                      className="bg-gradient-to-r from-teal-500 to-emerald-400 hover:opacity-90 text-slate-950 font-bold py-2 px-4 rounded-lg text-[11px] transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={13} />
                      เพิ่มผลงานใหม่
                    </button>
                  )}
                </div>

                {showPortfolioForm ? (
                  <form onSubmit={handlePortfolioSubmit} className="bg-slate-950/40 p-5 rounded-2xl border border-white/5 space-y-4">
                    <h4 className="text-xs font-bold text-teal-400 border-b border-white/5 pb-2">
                      {editingPortfolioId ? "✏️ แก้ไขข้อมูลผลงาน" : "➕ เพิ่มผลงานใหม่เข้าระบบ"}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <div>
                          <label className="block mb-1 text-[10px] text-slate-405 font-bold">ชื่อผลงาน / ชิ้นงาน *</label>
                          <input 
                            type="text" 
                            required 
                            value={portfolioForm.title} 
                            onChange={e => setPortfolioForm({...portfolioForm, title: e.target.value})} 
                            className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-white" 
                            placeholder="เช่น ผ้าบาติกเขียนมือลายดอกพิกุลทอง"
                          />
                        </div>
                        <div>
                          <label className="block mb-1 text-[10px] text-slate-405 font-bold">คำอธิบายรายละเอียดผลงาน *</label>
                          <textarea 
                            required 
                            rows={4}
                            value={portfolioForm.description} 
                            onChange={e => setPortfolioForm({...portfolioForm, description: e.target.value})} 
                            className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-white font-light" 
                            placeholder="เล่าเรื่องราวความพิเศษ เทคนิคที่ใช้ หรือระยะเวลาในการประดิษฐ์สร้างสรรค์..."
                          />
                        </div>
                      </div>
                      <div>
                        <ImageUploader 
                          label="ภาพถ่ายผลงาน (Portfolio Image) *"
                          value={portfolioForm.imageUrl}
                          onChange={url => setPortfolioForm({...portfolioForm, imageUrl: url})}
                          placeholder="ใส่ลิงก์รูปภาพ หรืออัปโหลดไฟล์..."
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end border-t border-white/5 pt-3.5">
                      <button
                        type="button"
                        onClick={() => {
                          setShowPortfolioForm(false);
                          setEditingPortfolioId(null);
                        }}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-bold cursor-pointer"
                      >
                        ยกเลิก
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-gradient-to-r from-teal-500 to-emerald-400 text-slate-950 font-bold rounded-lg text-[11px] hover:opacity-95 transition-all cursor-pointer"
                      >
                        {editingPortfolioId ? "บันทึกการแก้ไข" : "เพิ่มผลงาน"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {(editedSettings.portfolios || []).map((port) => (
                      <div key={port.id} className="bg-slate-950/40 p-3 rounded-2xl border border-white/5 flex gap-4 items-start hover:border-white/10 transition-all">
                        {port.imageUrl ? (
                          <img src={port.imageUrl} alt={port.title} className="w-24 h-24 object-cover rounded-xl bg-stone-900 flex-shrink-0 border border-white/5" />
                        ) : (
                          <div className="w-24 h-24 rounded-xl bg-stone-900 border border-white/5 flex-shrink-0 flex items-center justify-center text-slate-600 font-mono text-[9px]">
                            ไม่มีรูปภาพ
                          </div>
                        )}
                        <div className="flex-grow min-w-0 space-y-1">
                          <h4 className="font-bold text-white text-xs truncate">{port.title}</h4>
                          <p className="text-[10px] text-slate-400 line-clamp-3 font-light leading-relaxed">{port.description}</p>
                          <div className="flex items-center gap-2 pt-2">
                            <button
                              onClick={() => {
                                setPortfolioForm({ title: port.title, description: port.description, imageUrl: port.imageUrl });
                                setEditingPortfolioId(port.id);
                                setShowPortfolioForm(true);
                              }}
                              className="px-2.5 py-1.5 bg-slate-850 hover:bg-slate-800 text-teal-400 rounded-md text-[9px] font-bold border border-teal-500/10 cursor-pointer"
                            >
                              แก้ไขข้อมูล
                            </button>
                            <button
                              onClick={() => handleDeletePortfolio(port.id)}
                              className="px-2.5 py-1.5 bg-red-950/20 hover:bg-red-950/60 text-red-400 rounded-md text-[9px] font-bold border border-red-500/10 cursor-pointer"
                            >
                              ลบออก
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(editedSettings.portfolios || []).length === 0 && (
                      <div className="col-span-2 text-center py-10 bg-slate-950/10 border border-dashed border-white/5 rounded-2xl text-slate-500">
                        ยังไม่มีข้อมูลแฟ้มสะสมผลงานในระบบหลังบ้านค่ะ
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* T_artisans: Artisan Directory */}
            {activeTab === "artisans" && (
              <div className="space-y-4 text-xs text-slate-300 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-teal-400">🏅 จัดการทำเนียบช่างฝีมือชั้นครู (Artisan Directory)</h3>
                    <p className="text-[10px] text-slate-500 font-light font-sans">เชิดชูเกียรติและแนะนำครูศิลป์ ปราชญ์ท้องถิ่น และช่างฝีมือผู้ขับเคลื่อนวิสาหกิจน้ำน้อย</p>
                  </div>
                  {!showArtisanForm && (
                    <button
                      onClick={() => {
                        setArtisanForm({ name: "", expertise: "", bio: "", imageUrl: "" });
                        setEditingArtisanId(null);
                        setShowArtisanForm(true);
                      }}
                      className="bg-gradient-to-r from-teal-500 to-emerald-400 hover:opacity-90 text-slate-950 font-bold py-2 px-4 rounded-lg text-[11px] transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={13} />
                      เพิ่มทำเนียบช่างฝีมือ
                    </button>
                  )}
                </div>

                {showArtisanForm ? (
                  <form onSubmit={handleArtisanSubmit} className="bg-slate-950/40 p-5 rounded-2xl border border-white/5 space-y-4">
                    <h4 className="text-xs font-bold text-teal-400 border-b border-white/5 pb-2">
                      {editingArtisanId ? "✏️ แก้ไขข้อมูลช่างฝีมือ" : "➕ เพิ่มข้อมูลช่างฝีมือเข้าระบบ"}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <div>
                          <label className="block mb-1 text-[10px] text-slate-405 font-bold">ชื่อ-นามสกุล ช่างฝีมือ *</label>
                          <input 
                            type="text" 
                            required 
                            value={artisanForm.name} 
                            onChange={e => setArtisanForm({...artisanForm, name: e.target.value})} 
                            className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-white" 
                            placeholder="เช่น ป้าอิ่ม จิตรประจง"
                          />
                        </div>
                        <div>
                          <label className="block mb-1 text-[10px] text-slate-405 font-bold">ความเชี่ยวชาญ / ทักษะเฉพาะตัว *</label>
                          <input 
                            type="text" 
                            required 
                            value={artisanForm.expertise} 
                            onChange={e => setArtisanForm({...artisanForm, expertise: e.target.value})} 
                            className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-white" 
                            placeholder="เช่น ครูช่างเขียนลายผ้าบาติกโบราณ"
                          />
                        </div>
                        <div>
                          <label className="block mb-1 text-[10px] text-slate-405 font-bold">ประวัติ / ผลงานเด่น / ภูมิหลังโดยย่อ *</label>
                          <textarea 
                            required 
                            rows={4}
                            value={artisanForm.bio} 
                            onChange={e => setArtisanForm({...artisanForm, bio: e.target.value})} 
                            className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-white font-light" 
                            placeholder="อธิบายประสบการณ์การทำงาน รางวัลที่เคยได้รับ หรือความตั้งใจในการอนุรักษ์..."
                          />
                        </div>
                      </div>
                      <div>
                        <ImageUploader 
                          label="รูปภาพช่างฝีมือ (Artisan Photo) *"
                          value={artisanForm.imageUrl}
                          onChange={url => setArtisanForm({...artisanForm, imageUrl: url})}
                          placeholder="ใส่ลิงก์รูปภาพ หรือกดอัปโหลดไฟล์..."
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end border-t border-white/5 pt-3.5">
                      <button
                        type="button"
                        onClick={() => {
                          setShowArtisanForm(false);
                          setEditingArtisanId(null);
                        }}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-bold cursor-pointer"
                      >
                        ยกเลิก
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-gradient-to-r from-teal-500 to-emerald-400 text-slate-950 font-bold rounded-lg text-[11px] hover:opacity-95 transition-all cursor-pointer"
                      >
                        {editingArtisanId ? "บันทึกการแก้ไข" : "เพิ่มช่างฝีมือ"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {(editedSettings.artisans || []).map((art) => (
                      <div key={art.id} className="bg-slate-950/40 p-3 rounded-2xl border border-white/5 flex gap-4 items-start hover:border-white/10 transition-all">
                        {art.imageUrl ? (
                          <img src={art.imageUrl} alt={art.name} className="w-24 h-24 object-cover rounded-xl bg-stone-900 flex-shrink-0 border border-white/5" />
                        ) : (
                          <div className="w-24 h-24 rounded-xl bg-stone-900 border border-white/5 flex-shrink-0 flex items-center justify-center text-slate-600 font-mono text-[9px]">
                            ไม่มีรูปภาพ
                          </div>
                        )}
                        <div className="flex-grow min-w-0 space-y-1">
                          <h4 className="font-bold text-white text-xs truncate">{art.name}</h4>
                          <span className="inline-block text-[9px] bg-teal-950 text-teal-400 font-bold px-2 py-0.5 rounded-full border border-teal-500/20">{art.expertise}</span>
                          <p className="text-[10px] text-slate-400 line-clamp-3 font-light leading-relaxed">{art.bio}</p>
                          <div className="flex items-center gap-2 pt-2">
                            <button
                              onClick={() => {
                                setArtisanForm({ name: art.name, expertise: art.expertise, bio: art.bio, imageUrl: art.imageUrl });
                                setEditingArtisanId(art.id);
                                setShowArtisanForm(true);
                              }}
                              className="px-2.5 py-1.5 bg-slate-850 hover:bg-slate-800 text-teal-400 rounded-md text-[9px] font-bold border border-teal-500/10 cursor-pointer"
                            >
                              แก้ไขข้อมูล
                            </button>
                            <button
                              onClick={() => handleDeleteArtisan(art.id)}
                              className="px-2.5 py-1.5 bg-red-950/20 hover:bg-red-950/60 text-red-400 rounded-md text-[9px] font-bold border border-red-500/10 cursor-pointer"
                            >
                              ลบออก
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(editedSettings.artisans || []).length === 0 && (
                      <div className="col-span-2 text-center py-10 bg-slate-950/10 border border-dashed border-white/5 rounded-2xl text-slate-500">
                        ยังไม่มีข้อมูลทำเนียบช่างฝีมือในระบบหลังบ้านค่ะ
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* T_landmarks: Landmark/Map Directory */}
            {activeTab === "landmarks" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <MapIcon className="text-amber-500" size={16} />
                      <span>ตั้งค่าจุดปักหมุด แหล่งท่องเที่ยววัฒนธรรมและภูมิปัญญาตำบลน้ำน้อย</span>
                    </h3>
                    <p className="text-[10px] text-slate-400 font-light mt-1">
                      เพิ่ม ลบ หรือแก้ไขจุดเช็กอิน/สถานที่สำคัญทางประวัติศาสตร์เพื่อนำเสนอในหน้าแผนที่หลักของเว็บบอร์ด
                    </p>
                  </div>
                  {!showLandmarkForm && (
                    <button
                      onClick={() => {
                        setLandmarkForm({ name: "", type: "craft", lat: 7.0518, lng: 100.5285, description: "", phone: "", imageUrl: "" });
                        setEditingLandmarkId(null);
                        setShowLandmarkForm(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-400 text-slate-950 font-bold rounded-lg text-[10px] hover:opacity-95 transition-all self-start sm:self-center cursor-pointer"
                    >
                      <Plus size={12} />
                      <span>เพิ่มจุดปักหมุดใหม่</span>
                    </button>
                  )}
                </div>

                {showLandmarkForm ? (
                  <form onSubmit={handleLandmarkSubmit} className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 space-y-4">
                    <div className="font-bold text-xs text-white pb-2 border-b border-white/5">
                      {editingLandmarkId ? "✍️ แก้ไขข้อมูลจุดปักหมุดสถานที่" : "✨ เพิ่มจุดปักหมุดใหม่บนแผนที่"}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3.5">
                        <div>
                          <label className="block mb-1 text-[10px] text-slate-400 font-bold">ชื่อสถานที่ / แหล่งวัฒนธรรม *</label>
                          <input 
                            type="text" 
                            required 
                            value={landmarkForm.name} 
                            onChange={e => setLandmarkForm({...landmarkForm, name: e.target.value})} 
                            className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-white" 
                            placeholder="เช่น สำนักงานเทศบาลตำบลน้ำน้อย"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block mb-1 text-[10px] text-slate-400 font-bold">ประเภทสถานที่ *</label>
                            <select 
                              value={landmarkForm.type} 
                              onChange={e => setLandmarkForm({...landmarkForm, type: e.target.value as any})} 
                              className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-white text-xs"
                            >
                              <option value="admin">สถานที่ราชการ (Blue)</option>
                              <option value="craft">แหล่งงานหัตถกรรม/ช่างฝีมือ (Amber)</option>
                              <option value="temple">ศาสนสถาน/โบราณสถาน (Red)</option>
                              <option value="nature">แหล่งท่องเที่ยวธรรมชาติ (Emerald)</option>
                              <option value="market">ตลาด/ร้านค้าชุมชน (Purple)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block mb-1 text-[10px] text-slate-400 font-bold">เบอร์ติดต่อประสานงาน (ถ้ามี)</label>
                            <input 
                              type="text" 
                              value={landmarkForm.phone || ""} 
                              onChange={e => setLandmarkForm({...landmarkForm, phone: e.target.value})} 
                              className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-white" 
                              placeholder="เช่น 074-211111"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block mb-1 text-[10px] text-slate-400 font-bold">องศาทศนิยม ละติจูด (Latitude) *</label>
                            <input 
                              type="number" 
                              step="any"
                              required 
                              value={landmarkForm.lat} 
                              onChange={e => setLandmarkForm({...landmarkForm, lat: parseFloat(e.target.value) || 0})} 
                              className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-white" 
                              placeholder="เช่น 7.0518"
                            />
                          </div>

                          <div>
                            <label className="block mb-1 text-[10px] text-slate-400 font-bold">องศาทศนิยม ลองจิจูด (Longitude) *</label>
                            <input 
                              type="number" 
                              step="any"
                              required 
                              value={landmarkForm.lng} 
                              onChange={e => setLandmarkForm({...landmarkForm, lng: parseFloat(e.target.value) || 0})} 
                              className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-white" 
                              placeholder="เช่น 100.5285"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block mb-1 text-[10px] text-slate-400 font-bold">รายละเอียดสำคัญ / จุดขายเด่นของสถานที่ *</label>
                          <textarea 
                            required 
                            rows={4}
                            value={landmarkForm.description} 
                            onChange={e => setLandmarkForm({...landmarkForm, description: e.target.value})} 
                            className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-white font-light" 
                            placeholder="อธิบายกิจกรรมหลัก สิ่งที่นักท่องเที่ยวจะได้รับ หรือประวัติย่อสำคัญ..."
                          />
                        </div>
                      </div>

                      <div>
                        <ImageUploader 
                          label="รูปภาพสถานที่สำคัญ (Landmark Image) *"
                          value={landmarkForm.imageUrl}
                          onChange={url => setLandmarkForm({...landmarkForm, imageUrl: url})}
                          placeholder="ใส่ลิงก์รูปภาพ หรือกดอัปโหลดไฟล์..."
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end border-t border-white/5 pt-3.5">
                      <button
                        type="button"
                        onClick={() => {
                          setShowLandmarkForm(false);
                          setEditingLandmarkId(null);
                        }}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-bold cursor-pointer"
                      >
                        ยกเลิก
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-400 text-slate-950 font-bold rounded-lg text-[11px] hover:opacity-95 transition-all cursor-pointer"
                      >
                        {editingLandmarkId ? "บันทึกการแก้ไข" : "เพิ่มพิกัดสถานที่"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {(editedSettings.landmarks || []).map((loc) => (
                      <div key={loc.id} className="bg-slate-950/40 p-3 rounded-2xl border border-white/5 flex gap-4 items-start hover:border-white/10 transition-all">
                        {loc.imageUrl ? (
                          <img src={loc.imageUrl} alt={loc.name} className="w-24 h-24 object-cover rounded-xl bg-stone-900 flex-shrink-0 border border-white/5" />
                        ) : (
                          <div className="w-24 h-24 rounded-xl bg-stone-900 border border-white/5 flex-shrink-0 flex items-center justify-center text-slate-600 font-mono text-[9px]">
                            ไม่มีรูปภาพ
                          </div>
                        )}
                        <div className="flex-grow min-w-0 space-y-1">
                          <h4 className="font-bold text-white text-xs truncate">{loc.name}</h4>
                          <span className="inline-block text-[9px] bg-amber-950 text-amber-400 font-bold px-2 py-0.5 rounded-full border border-amber-500/20">
                            {loc.type === 'admin' ? '🏛️ สถานที่ราชการ' : 
                             loc.type === 'craft' ? '✨ งานหัตถกรรม/ฝีมือ' :
                             loc.type === 'temple' ? '🙏 โบราณสถาน/วัด' :
                             loc.type === 'nature' ? '🌳 แหล่งธรรมชาติ' : '🛒 ร้านค้าชุมชน'}
                          </span>
                          <div className="text-[9px] text-slate-400 font-mono">พิกัด: {loc.lat}, {loc.lng}</div>
                          <p className="text-[10px] text-slate-400 line-clamp-3 font-light leading-relaxed">{loc.description}</p>
                          <div className="flex items-center gap-2 pt-2">
                            <button
                              onClick={() => {
                                setLandmarkForm({ 
                                  name: loc.name, 
                                  type: loc.type, 
                                  lat: loc.lat, 
                                  lng: loc.lng, 
                                  description: loc.description, 
                                  phone: loc.phone || "", 
                                  imageUrl: loc.imageUrl 
                                });
                                setEditingLandmarkId(loc.id);
                                setShowLandmarkForm(true);
                              }}
                              className="px-2.5 py-1.5 bg-slate-850 hover:bg-slate-800 text-amber-400 rounded-md text-[9px] font-bold border border-amber-500/10 cursor-pointer"
                            >
                              แก้ไขข้อมูล
                            </button>
                            <button
                              onClick={() => handleDeleteLandmark(loc.id)}
                              className="px-2.5 py-1.5 bg-red-950/20 hover:bg-red-950/60 text-red-400 rounded-md text-[9px] font-bold border border-red-500/10 cursor-pointer"
                            >
                              ลบออก
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(editedSettings.landmarks || []).length === 0 && (
                      <div className="col-span-2 text-center py-10 bg-slate-950/10 border border-dashed border-white/5 rounded-2xl text-slate-500">
                        ยังไม่มีข้อมูลพิกัดสถานที่ท่องเที่ยวในระบบหลังบ้านค่ะ
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* T5: Site Settings editor */}
            {activeTab === "settings" && (
              <>
                <form onSubmit={handleUpdateSettingsSubmit} className="space-y-4 text-xs text-slate-300">
                <span className="text-xs text-slate-500 font-semibold block">ควบคุมการแสดงผลและข้อมูลติดต่อของร้านค้าประยุกต์</span>
                
                <div className="grid grid-cols-2 gap-3 bg-slate-950/40 p-4 rounded-2xl border border-white/5">
                  <div>
                    <label className="block mb-1 text-[10px] text-slate-400">ชื่อไตเติ้ลร้านค้า (Website Name) *</label>
                    <input type="text" required value={editedSettings.siteName} onChange={e => setEditedSettings({...editedSettings, siteName: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white" />
                  </div>
                  <div>
                    <label className="block mb-1 text-[10px] text-slate-400">สโลแกนใต้ชื่อเว็ป (Subtitle) *</label>
                    <input type="text" required value={editedSettings.siteSubtitle} onChange={e => setEditedSettings({...editedSettings, siteSubtitle: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white" />
                  </div>
                  <div className="col-span-2">
                    <ImageUploader 
                      label="รูปภาพโลโก้เว็บไซต์ (Website Logo - หากเว้นว่างไว้จะใช้โลโก้ทองคำอัตโนมัติ)"
                      value={editedSettings.siteLogoUrl || ""}
                      onChange={url => setEditedSettings({...editedSettings, siteLogoUrl: url})}
                      placeholder="เช่น https://domain.com/my-logo.png"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-[10px] text-slate-400">เบอร์โทรศัพท์ TrueMoney Wallet เติมออโต้ *</label>
                    <input type="text" required value={editedSettings.truewalletPhone} onChange={e => setEditedSettings({...editedSettings, truewalletPhone: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white" />
                  </div>
                  <div>
                    <label className="block mb-1 text-[10px] text-slate-400">เลขบัญชีธนาคารผู้รับเงินโอน *</label>
                    <input type="text" required value={editedSettings.bankAccountNumber || ""} onChange={e => setEditedSettings({...editedSettings, bankAccountNumber: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white" />
                  </div>
                  <div>
                    <label className="block mb-1 text-[10px] text-slate-400">ชื่อเจ้าของบัญชี (ทั้งภาษาไทยและอังกฤษ) *</label>
                    <input type="text" required value={editedSettings.bankAccountName || ""} onChange={e => setEditedSettings({...editedSettings, bankAccountName: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white" />
                  </div>
                  <div>
                    <label className="block mb-1 text-[10px] text-slate-400">ชื่อย่อ/ชื่อเต็มธนาคารรับโอน *</label>
                    <input type="text" required value={editedSettings.bankName || ""} onChange={e => setEditedSettings({...editedSettings, bankName: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white" />
                  </div>
                  <div className="col-span-2">
                    <label className="block mb-1 text-[10px] text-slate-400">ลิงก์เฟซบุ๊ค แชนแนล (Facebook Page Link) *</label>
                    <input type="url" required value={editedSettings.contactFacebook} onChange={e => setEditedSettings({...editedSettings, contactFacebook: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white" />
                  </div>
                  <div>
                    <label className="block mb-1 text-[10px] text-slate-400">ลิงก์ดิสคอร์ด ชุมชน (Discord Guild Share) *</label>
                    <input type="url" required value={editedSettings.contactDiscord} onChange={e => setEditedSettings({...editedSettings, contactDiscord: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white" />
                  </div>
                  <div>
                    <label className="block mb-1 text-[10px] text-slate-400">บัญชีไอดี LINE ซัพพอร์ต (@Line Support) *</label>
                    <input type="url" required value={editedSettings.contactLine} onChange={e => setEditedSettings({...editedSettings, contactLine: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white" />
                  </div>

                  {/* CUSTOM DECORATION COLOR PICKER */}
                  <div className="col-span-2 border-t border-white/5 pt-4 mt-2">
                    <span className="text-[11px] font-bold text-teal-400 block mb-2 uppercase tracking-wide">🎨 ตกแต่งโทนสีภาพลักษณ์เว็บไซต์ (Website Theme Color Decorator)</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/60 p-3.5 rounded-xl border border-white/5">
                      <div>
                        <label className="block mb-1.5 text-[10px] text-slate-400">เลือกโทนสีแนะนำสำเร็จรูป (Predefined Accent Presets)</label>
                        <select 
                          value={
                            ["amber", "crimson", "cyan", "indigo", "emerald", "rose", "orange", "violet"].includes(editedSettings.primaryColor)
                              ? editedSettings.primaryColor 
                              : editedSettings.primaryColor?.startsWith("#") ? "custom" : "amber"
                          } 
                          onChange={e => {
                            const val = e.target.value;
                            if (val === "custom") {
                              setEditedSettings({...editedSettings, primaryColor: "#8E6D4E"});
                            } else {
                              setEditedSettings({...editedSettings, primaryColor: val});
                            }
                          }} 
                          className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white text-xs"
                        >
                          <option value="amber">Amber/Brown (น้ำตาลลายทอง อัตลักษณ์หัตถศิลป์ชุมชนน้ำน้อยดั้งเดิม)</option>
                          <option value="emerald">Emerald Green (เขียวมรกตป่าเขา ชุมชนสมุนไพรและเกษตรอินทรีย์)</option>
                          <option value="crimson">Crimson Red (แดงเพลิงอารยธรรม สไตล์นีออนสะกดอารมณ์)</option>
                          <option value="cyan">Cyan Blue (ฟ้าครามใสเทคโนโลยี สว่างพรีเมียมดูมีมิติ)</option>
                          <option value="indigo">Indigo Violet (สีครามสิริมงคลหรูหรา อัญชันเลิศล้ำ)</option>
                          <option value="rose">Rose Pink (ชมพูกุหลาบ อ่อนหวาน น่ารัก อบอุ่นต้อนรับ)</option>
                          <option value="orange">Sunset Orange (ส้มอาทิตย์อัสดง นำโชคและรุ่งโรจน์)</option>
                          <option value="violet">Deep Violet (ม่วงวิจิตร ลึกลับน่าค้นหาเปี่ยมระดับ)</option>
                          <option value="custom">🎨 ระบุรหัสสีสไลด์บาร์เอง (Custom Hex Color Code)</option>
                        </select>
                        <p className="text-[9px] text-slate-500 mt-1">โทนสีหลักจะนำไปปรับปุ่ม, เส้นขอบแบนเนอร์, ป้ายสนับสนุน และจุดเน้นทั่วทั้งระบบโดยอัตโนมัติ!</p>
                      </div>

                      <div>
                        <label className="block mb-1.5 text-[10px] text-slate-400">เลือกเฉดสีแบรนด์เฉพาะตัว (Brand Theme Color Picker / Hex Code) *</label>
                        <div className="flex gap-2">
                          <input 
                            type="color" 
                            value={editedSettings.primaryColor?.startsWith("#") ? editedSettings.primaryColor : "#8E6D4E"} 
                            onChange={e => setEditedSettings({...editedSettings, primaryColor: e.target.value})} 
                            className="w-11 h-9 bg-slate-900 border border-white/10 rounded-lg p-1 cursor-pointer flex-shrink-0"
                            title="เลือกสีจากพาเลท"
                          />
                          <input 
                            type="text" 
                            required 
                            placeholder="#8E6D4E"
                            value={editedSettings.primaryColor} 
                            onChange={e => setEditedSettings({...editedSettings, primaryColor: e.target.value})} 
                            className="flex-grow bg-slate-900 border border-white/10 rounded-lg p-2 text-white text-xs font-mono" 
                            title="ป้อนรหัสสี HEX (เช่น #8E6D4E)"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CAROUSEL SLIDER MANAGEMENT */}
                  <div className="col-span-2 border-t border-white/5 pt-4 mt-2">
                    <span className="text-[11px] font-bold text-teal-400 block mb-2 uppercase tracking-wide">🖼️ ระบบอัปโหลดและจัดการรูปภาพสไลด์หน้าโฮมเพจ (Homepage Carousel Slides)</span>
                    <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 space-y-4">
                      
                      {/* Current list of banner images */}
                      <label className="block text-[10px] text-slate-400 font-bold mb-1">📋 รายการภาพสไลด์ที่กำลังใช้งานอยู่ในปัจจุบัน (คลิกลากเพื่อจัดลำดับ/แก้ไขได้ทันที):</label>
                      <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
                        {(editedSettings.banners || []).map((slide, sIdx) => (
                          <div key={sIdx} className="flex flex-col sm:flex-row sm:items-center gap-3 bg-slate-950/70 p-3 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                            <div className="flex items-center gap-3 flex-grow">
                              <img src={slide} alt={`Slide ${sIdx+1}`} className="w-16 h-10 object-cover rounded-lg bg-stone-900 flex-shrink-0 shadow border border-white/5" />
                              <div className="flex-grow min-w-0">
                                <span className="text-[8.5px] font-bold text-teal-400 uppercase tracking-widest block">ลำดับสไลด์ที่ {sIdx + 1}</span>
                                <input 
                                  type="text" 
                                  value={slide} 
                                  onChange={e => {
                                    const updatedBanners = [...(editedSettings.banners || [])];
                                    updatedBanners[sIdx] = e.target.value;
                                    setEditedSettings({...editedSettings, banners: updatedBanners});
                                  }}
                                  className="w-full bg-transparent border-none p-0 text-[10px] text-slate-300 focus:ring-0 focus:outline-none truncate font-mono" 
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-2 self-end sm:self-auto">
                              <label className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 rounded-lg text-[9px] font-bold cursor-pointer transition-all flex-shrink-0">
                                เปลี่ยนรูป
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  className="hidden" 
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    if (!file.type.startsWith("image/")) {
                                      alert("กรุณาเลือกไฟล์รูปภาพเท่านั้นค่ะ");
                                      return;
                                    }
                                    const reader = new FileReader();
                                    reader.onloadend = async () => {
                                      const base64Data = reader.result as string;
                                      try {
                                        const res = await fetch("/api/upload", {
                                          method: "POST",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({ filename: file.name, base64Data })
                                        });
                                        if (res.ok) {
                                          const data = await res.json();
                                          const updatedBanners = [...(editedSettings.banners || [])];
                                          updatedBanners[sIdx] = data.url;
                                          setEditedSettings({...editedSettings, banners: updatedBanners});
                                        } else {
                                          alert("อัปโหลดไฟล์ไม่สำเร็จ");
                                        }
                                      } catch (err) {
                                        console.error(err);
                                        alert("เกิดข้อผิดพลาดขณะส่งไฟล์");
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  }}
                                />
                              </label>
                              <button 
                                type="button"
                                onClick={() => {
                                  const updatedBanners = (editedSettings.banners || []).filter((_, bIdx) => bIdx !== sIdx);
                                  setEditedSettings({...editedSettings, banners: updatedBanners});
                                }}
                                className="px-2.5 py-1.5 bg-red-950/30 hover:bg-red-950/70 border border-red-500/20 text-red-400 hover:text-white rounded-lg text-[9px] font-bold transition-all cursor-pointer"
                                title="ลบสไลด์นี้ออก"
                              >
                                ลบออก
                              </button>
                            </div>
                          </div>
                        ))}
                        {(editedSettings.banners || []).length === 0 && (
                          <p className="text-[10px] text-slate-500 py-4 text-center border border-dashed border-white/5 rounded-xl">ไม่มีรูปภาพสไลด์ กรุณาป้อนลิงก์ด้านล่างเพื่อเพิ่มภาพแบนเนอร์แสดงหน้าแรกนะคะ</p>
                        )}
                      </div>

                      {/* Add new slide interface */}
                      <div className="border-t border-white/[0.05] pt-3.5 space-y-3">
                        <div className="flex flex-col sm:flex-row items-end gap-2">
                          <div className="flex-grow w-full">
                            <ImageUploader 
                              label="➕ เพิ่มรูปภาพสไลด์แบนเนอร์ใหม่ (Add Slide Image):"
                              value={newSlideUrl}
                              onChange={(url) => setNewSlideUrl(url)}
                              placeholder="ตัวอย่างเช่น https://images.unsplash.com/photo-1550159930-40066082a4fc?..."
                            />
                          </div>
                          <button 
                            type="button"
                            onClick={() => {
                              const url = newSlideUrl.trim();
                              if (!url) {
                                alert("กรุณากรอกลิงก์ที่อยู่รูปภาพหรือแนบรูปไฟล์อัปโหลดก่อนกดเพิ่มนะคะ!");
                                return;
                              }
                              const updatedBanners = [...(editedSettings.banners || []), url];
                              setEditedSettings({...editedSettings, banners: updatedBanners});
                              setNewSlideUrl("");
                            }}
                            className="bg-gradient-to-r from-teal-500 to-emerald-400 hover:opacity-90 text-slate-950 font-bold py-2 px-4 rounded-lg text-xs transition-all cursor-pointer flex-shrink-0"
                          >
                            เพิ่มสไลด์ใหม่ +
                          </button>
                        </div>

                        {/* Presets galleries */}
                        <div className="p-2 bg-slate-950/50 rounded-xl border border-white/5">
                          <span className="text-[8.5px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wide">💡 รวมชุดภาพอัตลักษณ์วิถีชีวิตไทยและหัตถศิลป์ชุมชนน้ำน้อยพรีเซ็ต (เพิ่มใน 1-Click):</span>
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                            {[
                              { label: "ผ้าถักบาติกถิ่นน้ำน้อย", url: "https://images.unsplash.com/photo-1550159930-40066082a4fc?auto=format&fit=crop&w=1200&q=80" },
                              { label: "เครื่องจักสานหวายประณีต", url: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80" },
                              { label: "รังผึ้งป่าห้าเดือนชุมชน", url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80" },
                              { label: "เครื่องดินเผากรรมวิธีโบราณ", url: "https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?auto=format&fit=crop&w=1200&q=80" },
                              { label: "สมุนไพรสดและสวนครัว", url: "https://images.unsplash.com/photo-1447078806655-4092956f0330?auto=format&fit=crop&w=1200&q=80" }
                            ].map((presetItem, pIdx) => (
                              <button
                                key={pIdx}
                                type="button"
                                onClick={() => {
                                  const updatedBanners = [...(editedSettings.banners || []), presetItem.url];
                                  setEditedSettings({...editedSettings, banners: updatedBanners});
                                }}
                                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-[8.5px] text-slate-300 border border-white/5 transition-all text-center cursor-pointer font-medium truncate"
                                title={`คลิกเพื่อแอดรูป "${presetItem.label}" เข้าสู่รายการสไลด์`}
                              >
                                📸 {presetItem.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                {/* ANNOUNCEMENT POPUP CONFIGURATION BLOCK */}
                <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <div>
                      <span className="text-[11px] font-bold text-amber-400 block uppercase tracking-wide">📢 ระบบป๊อปอัพข่าวสารต้อนรับเมื่อเข้าเว็บไซต์ (Announcement Welcome Popup)</span>
                      <span className="text-[9.5px] text-slate-400">กำหนดข้อความ ประกาศ หรือรูปภาพแบนเนอร์ที่จะเด้งแสดงขึ้นมาทันทีเมื่อผู้ใช้งานเปิดหน้าแรกของเว็บไซต์</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={!!editedSettings.announcementActive} 
                        onChange={e => setEditedSettings({...editedSettings, announcementActive: e.target.checked})}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                      <span className="ml-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-300">
                        {editedSettings.announcementActive ? "💡 เปิดใช้งาน" : "💤 ปิดใช้งาน"}
                      </span>
                    </label>
                  </div>

                  {editedSettings.announcementActive && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      {/* Form Inputs */}
                      <div className="space-y-3">
                        <div>
                          <label className="block mb-1 text-[10px] text-slate-400">หัวข้อประกาศข่าวสาร (Announcement Title) *</label>
                          <input 
                            type="text" 
                            required={editedSettings.announcementActive} 
                            value={editedSettings.announcementTitle || ""} 
                            onChange={e => setEditedSettings({...editedSettings, announcementTitle: e.target.value})} 
                            className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white text-xs" 
                            placeholder="เช่น ประกาศวันหยุดร้าน หรือข่าวสารจัดตั้งกองทุน"
                          />
                        </div>

                        <div>
                          <label className="block mb-1 text-[10px] text-slate-400">เนื้อหารายละเอียด (Announcement Description - รองรับบรรทัดใหม่) *</label>
                          <textarea 
                            rows={3}
                            required={editedSettings.announcementActive} 
                            value={editedSettings.announcementBody || ""} 
                            onChange={e => setEditedSettings({...editedSettings, announcementBody: e.target.value})} 
                            className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white text-xs resize-none" 
                            placeholder="รายละเอียดข่าวสารที่คุณต้องการบอกกล่าวให้ลูกค้าทุกท่านรับทราบทันที..."
                          />
                        </div>

                        <div>
                          <ImageUploader 
                            label="รูปภาพในป๊อปอัพ (Optional Image - ไม่ระบุก็ได้)"
                            value={editedSettings.announcementImageUrl || ""}
                            onChange={url => setEditedSettings({...editedSettings, announcementImageUrl: url})}
                            placeholder="ใส่ลิงก์รูปภาพ หรือกดปุ่มแนบรูปเพื่ออัปโหลด..."
                          />
                        </div>
                      </div>

                      {/* Real-time live mini preview */}
                      <div className="bg-slate-900/40 p-3 rounded-xl border border-dashed border-white/10 flex flex-col justify-between">
                        <div>
                          <span className="text-[9px] font-bold text-teal-400 block mb-2 uppercase tracking-wide">🔍 จำลองมุมมองตัวอย่าง (Live Preview)</span>
                          <div className="bg-stone-950 p-4 rounded-xl border border-amber-500/20 shadow-xl space-y-2 max-w-sm mx-auto">
                            {editedSettings.announcementImageUrl && (
                              <div className="aspect-video w-full rounded bg-stone-900 overflow-hidden">
                                <img src={editedSettings.announcementImageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e)=>{(e.target as any).style.display='none'}} />
                              </div>
                            )}
                            <h5 className="font-bold text-amber-500 text-[11px] font-serif leading-none truncate">
                              {editedSettings.announcementTitle || "หัวข้อข่าวสารของคุณ"}
                            </h5>
                            <p className="text-[10px] text-stone-400 whitespace-pre-wrap leading-relaxed font-light line-clamp-3">
                              {editedSettings.announcementBody || "รายละเอียดเนื้อหาข่าวสาร..."}
                            </p>
                            <div className="pt-2 flex justify-end">
                              <span className="px-3 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded text-[9px] font-bold font-sans">ตกลง เข้าสู่เว็ปไซต์</span>
                            </div>
                          </div>
                        </div>
                        <span className="text-[9px] text-stone-500 block text-right mt-2">สลับสถานะเปิดใช้งานเพื่อแสดงในหน้าหลักทันทีเมื่อเข้าชม</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* SEASONAL EFFECTS CONFIGURATION BLOCK */}
                <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 space-y-3">
                  <div>
                    <span className="text-[11px] font-bold text-teal-400 block uppercase tracking-wide">🎉 ระบบเอฟเฟกต์ตามเทศกาล (Seasonal Effects)</span>
                    <span className="text-[9.5px] text-slate-400">เลือกเปิดใช้งานเอฟเฟกต์แอนิเมชันตกแต่งหน้าหลักตามช่วงเทศกาลเฉลิมฉลองต่างๆ (เลือกกดเปลี่ยนได้ทันทีเพียง 1 คลิก!)</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-1">
                    {[
                      { value: "none", label: "🚫 ปิด (None)", desc: "ไม่แสดงเอฟเฟกต์" },
                      { value: "snow", label: "❄️ หิมะตก (Snow)", desc: "หิมะโปรยปรายละมุนตา" },
                      { value: "halloween", label: "🎃 ฮาโลวีน", desc: "ฟักทองบินแสนซน" },
                      { value: "valentine", label: "❤️ วาเลนไทน์", desc: "หัวใจลอยฟุ้งอบอุ่น" },
                      { value: "christmas", label: "🎅 คริสต์มาส", desc: "กล่องของขวัญและหิมะ" },
                      { value: "songkran", label: "💦 สงกรานต์", desc: "ละอองน้ำเย็นฉ่ฉ่ำ" },
                      { value: "newyear", label: "🎆 ปีใหม่ (New Year)", desc: "ประกายไฟระยิบระยับ" },
                      { value: "goldenstar", label: "✨ ดาวระวิบวับทอง", desc: "ดาวสีทองหรูหราระยิบระยับ" }
                    ].map((eff) => {
                      const isActive = editedSettings.seasonalEffect === eff.value || (!editedSettings.seasonalEffect && eff.value === "none");
                      return (
                        <button
                          key={eff.value}
                          type="button"
                          onClick={() => setEditedSettings({ ...editedSettings, seasonalEffect: eff.value as any })}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between h-[68px] ${
                            isActive
                              ? "border-[#8E6D4E] bg-[#8E6D4E]/10 text-white shadow-md"
                              : "border-white/5 bg-slate-900 hover:bg-slate-800 text-slate-300"
                          }`}
                        >
                          {isActive && (
                            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#8E6D4E] animate-pulse" />
                          )}
                          <span className="text-[10px] font-bold block truncate">{eff.label}</span>
                          <span className="text-[8px] text-slate-400 block leading-tight">{eff.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* WEBSITE BACKGROUND CONFIGURATION BLOCK */}
                <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 space-y-3">
                  <div>
                    <span className="text-[11px] font-bold text-teal-400 block uppercase tracking-wide">🖼️ ระบบพื้นหลังของเว็บไซต์ (Website Background Image / Style)</span>
                    <span className="text-[9.5px] text-slate-400">เปลี่ยนภาพพื้นหลังของหน้าหลักเพื่อความหรูหราอลังการ (เว้นว่างเพื่อใช้พื้นหลังเรียบหรูสไตล์ Cosmic โบราณดั้งเดิม)</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                    <div className="md:col-span-2 space-y-3">
                      <div>
                        <ImageUploader 
                          label="รูปภาพพื้นหลังเว็บไซต์ (Background Image)"
                          value={editedSettings.siteBackgroundUrl || ""}
                          onChange={url => setEditedSettings({...editedSettings, siteBackgroundUrl: url})}
                          placeholder="ใส่ลิงก์รูปภาพ หรือกดปุ่มแนบรูปเพื่ออัปโหลด..."
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[8.5px] font-bold text-slate-400 block uppercase tracking-wide">💡 ชุดพื้นหลังมงคลธรรมชาติแนะนำ (1-Click Presets):</span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                          {[
                            { label: "ผืนทรายทองคำ", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80" },
                            { label: "หมอกมืดครามลุ่มน้ำ", url: "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&w=1200&q=80" },
                            { label: "ไม้ไผ่ธรรมชาติสีพาสเทล", url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80" },
                            { label: "ผืนน้ำสลัวหรูหรา", url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80" },
                            { label: "สลัดคราบสีชาร์โคลพรีเมียม", url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=80" },
                          ].map((bgPreset, bIdx) => (
                            <button
                              key={bIdx}
                              type="button"
                              onClick={() => setEditedSettings({...editedSettings, siteBackgroundUrl: bgPreset.url})}
                              className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-[8.5px] text-slate-300 border border-white/5 truncate transition-all text-center cursor-pointer"
                            >
                              🌄 {bgPreset.label}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => setEditedSettings({...editedSettings, siteBackgroundUrl: ""})}
                            className="p-1.5 rounded bg-red-950/40 hover:bg-red-900/60 text-[8.5px] text-red-300 border border-red-500/10 truncate transition-all text-center cursor-pointer font-bold"
                          >
                            🗑️ ล้างภาพพื้นหลัง
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="bg-slate-900/40 p-3 rounded-xl border border-dashed border-white/10 flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] font-bold text-teal-400 block mb-1 uppercase tracking-wide">🔍 ตัวอย่างภาพพื้นหลัง</span>
                        {editedSettings.siteBackgroundUrl ? (
                          <div className="aspect-[16/10] w-full rounded bg-stone-900 overflow-hidden border border-white/5 shadow-md">
                            <img src={editedSettings.siteBackgroundUrl} alt="Background Preview" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="aspect-[16/10] w-full rounded bg-stone-950 border border-white/5 flex items-center justify-center text-center p-2">
                            <span className="text-[10px] text-slate-500 font-light">ใช้ภาพพื้นหลังสีทึบ/ธรรมชาติดั้งเดิม</span>
                          </div>
                        )}
                      </div>
                      <span className="text-[9.5px] text-stone-500 block text-right mt-1.5">มีผลโดยตรงกับพื้นหลังทั้งในโหมดมืดและสว่าง</span>
                    </div>
                  </div>
                </div>

                {/* PERSISTENT ANNOUNCEMENT BAR CONFIGURATION BLOCK */}
                <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <div>
                      <span className="text-[11px] font-bold text-[#E2C7A9] block uppercase tracking-wide">📣 ช่องประกาศ/แถบประกาศหน้าแรก (Announcement Banner Marquee)</span>
                      <span className="text-[9.5px] text-slate-400">เพิ่มช่องแถบประกาศเลื่อนวิ่งได้สุดหรูหราด้านบนสุด เพื่อแจ้งโปรโมชั่น ช่องทางติดต่อ หรือข่าวสารด่วน</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={!!editedSettings.announcementBarActive} 
                        onChange={e => setEditedSettings({...editedSettings, announcementBarActive: e.target.checked})}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                      <span className="ml-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-300">
                        {editedSettings.announcementBarActive ? "💡 เปิดแสดงแถบ" : "💤 ซ่อนแถบไว้"}
                      </span>
                    </label>
                  </div>

                   {editedSettings.announcementBarActive && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                      <div className="md:col-span-2 space-y-3.5">
                        {/* Text and Prefix tag */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="sm:col-span-2">
                            <label className="block mb-1 text-[10px] text-slate-400">ข้อความประกาศวิ่ง/ปกติ (Announcement Text) *</label>
                            <input 
                              type="text" 
                              required={editedSettings.announcementBarActive} 
                              value={editedSettings.announcementBarText || ""} 
                              onChange={e => setEditedSettings({...editedSettings, announcementBarText: e.target.value})} 
                              className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white text-xs" 
                              placeholder="พิมพ์ข้อความที่ต้องการประกาศ เช่น ✨ ยินดีต้อนรับสู่เว็บหัตถศิลป์ตำบลน้ำน้อย..."
                            />
                          </div>
                          <div>
                            <label className="block mb-1 text-[10px] text-slate-400">🏷️ ป้ายคำนำหน้า (Static Tag)</label>
                            <input 
                              type="text" 
                              value={editedSettings.announcementBarPrefix || ""} 
                              onChange={e => setEditedSettings({...editedSettings, announcementBarPrefix: e.target.value})} 
                              className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white text-xs" 
                              placeholder="เช่น 📢 ประกาศ, ✨ SPECIAL"
                            />
                          </div>
                        </div>

                        {/* Premium Style Presets */}
                        <div className="space-y-1">
                          <label className="block text-[10px] text-slate-400">👑 สไตล์แถบประกาศระดับพรีเมียม (Premium Style Presets)</label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5">
                            {[
                              { value: 'solid', label: "🎨 คลาสสิกสีปกติ", desc: "ใช้สีด้านล่างที่เราแต่งเอง" },
                              { value: 'gradient-gold', label: "🏆 สีทองราชวงศ์", desc: "ไล่ระดับหรูประกายทอง" },
                              { value: 'neon-glow', label: "⚡ นีออนเรืองแสง", desc: "สว่างล้ำสะกดสายตา" },
                              { value: 'glassmorphism', label: "💎 กระจกฝ้าโมเดิร์น", desc: "เบลอหลังดูดีสไตล์โปร" }
                            ].map((preset) => {
                              const isSel = (editedSettings.announcementBarStyle || 'solid') === preset.value;
                              return (
                                <button
                                  key={preset.value}
                                  type="button"
                                  onClick={() => setEditedSettings({ ...editedSettings, announcementBarStyle: preset.value as any })}
                                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between h-[54px] ${
                                    isSel
                                      ? "border-[#8E6D4E] bg-[#8E6D4E]/10 text-white shadow-md"
                                      : "border-white/5 bg-slate-900/60 hover:bg-slate-800 text-slate-300"
                                  }`}
                                >
                                  <span className="text-[9.5px] font-bold block truncate">{preset.label}</span>
                                  <span className="text-[8px] text-slate-400 block leading-tight">{preset.desc}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Speed range slider */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <label className="block text-[10px] text-slate-400">⏱️ ความเร็วในการเลื่อนข้อความ (Speed Duration: {editedSettings.announcementBarSpeed || 25} วินาที)</label>
                            <span className="text-[9px] text-[#8E6D4E] font-bold font-mono">
                              {(editedSettings.announcementBarSpeed || 25) <= 12 ? "⚡ เร็วสุด" : (editedSettings.announcementBarSpeed || 25) <= 22 ? "🚀 เร็ว" : (editedSettings.announcementBarSpeed || 25) <= 35 ? "✨ ปกติ" : (editedSettings.announcementBarSpeed || 25) <= 55 ? "🐢 ช้าพริ้ว" : "💤 ช้ามาก"}
                            </span>
                          </div>
                          <div className="flex gap-3 items-center">
                            <input 
                              type="range" 
                              min="6" 
                              max="90" 
                              value={editedSettings.announcementBarSpeed || 25} 
                              onChange={e => setEditedSettings({...editedSettings, announcementBarSpeed: parseInt(e.target.value)})}
                              className="flex-1 accent-[#8E6D4E] h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="text-[10px] text-slate-300 font-mono w-8 text-right">{editedSettings.announcementBarSpeed || 25}s</span>
                          </div>
                          <p className="text-[8px] text-slate-500 leading-none mt-1">
                            * ค่าน้อยจะเลื่อนเร็ว ค่ามากจะเลื่อนช้าลงอย่างหรูหรานุ่มนวลละมุนตา
                          </p>
                        </div>

                        {/* Color inputs (only shown for solid or custom styling) */}
                        <div className="grid grid-cols-2 gap-3 pt-0.5">
                          <div>
                            <label className="block mb-1 text-[10px] text-slate-400">สีพื้นหลัง (Background Color - สำหรับสีปกติ)</label>
                            <div className="flex gap-1.5 items-center">
                              <input 
                                type="color" 
                                value={editedSettings.announcementBarBgColor || "#8E6D4E"} 
                                onChange={e => setEditedSettings({...editedSettings, announcementBarBgColor: e.target.value})} 
                                className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer"
                                disabled={(editedSettings.announcementBarStyle || 'solid') !== 'solid' && (editedSettings.announcementBarStyle || 'solid') !== 'neon-glow'}
                              />
                              <input 
                                type="text" 
                                value={editedSettings.announcementBarBgColor || "#8E6D4E"} 
                                onChange={e => setEditedSettings({...editedSettings, announcementBarBgColor: e.target.value})} 
                                className="flex-1 bg-slate-900 border border-white/10 rounded-lg p-1.5 text-white text-xs text-center font-mono"
                                disabled={(editedSettings.announcementBarStyle || 'solid') !== 'solid' && (editedSettings.announcementBarStyle || 'solid') !== 'neon-glow'}
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block mb-1 text-[10px] text-slate-400">สีของตัวอักษร (Text Color - สำหรับสีปกติ)</label>
                            <div className="flex gap-1.5 items-center">
                              <input 
                                type="color" 
                                value={editedSettings.announcementBarTextColor || "#FFFFFF"} 
                                onChange={e => setEditedSettings({...editedSettings, announcementBarTextColor: e.target.value})} 
                                className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer"
                                disabled={(editedSettings.announcementBarStyle || 'solid') !== 'solid' && (editedSettings.announcementBarStyle || 'solid') !== 'glassmorphism'}
                              />
                              <input 
                                type="text" 
                                value={editedSettings.announcementBarTextColor || "#FFFFFF"} 
                                onChange={e => setEditedSettings({...editedSettings, announcementBarTextColor: e.target.value})} 
                                className="flex-1 bg-slate-900 border border-white/10 rounded-lg p-1.5 text-white text-xs text-center font-mono"
                                disabled={(editedSettings.announcementBarStyle || 'solid') !== 'solid' && (editedSettings.announcementBarStyle || 'solid') !== 'glassmorphism'}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Presets */}
                        <div className="space-y-1 pt-1">
                          <span className="text-[8.5px] font-bold text-slate-400 block uppercase tracking-wide">🎨 ชุดธีมสีแนะนำพิเศษ (Preset Luxury Themes):</span>
                          <div className="flex flex-wrap gap-1.5">
                            {[
                              { label: "ทองกิตติยศ", bg: "#8E6D4E", text: "#FFFFFF" },
                              { label: "รัตติกาลครามทอง", bg: "#1C1815", text: "#E2C7A9" },
                              { label: "มงคลหยกนำโชค", bg: "#064E3B", text: "#D1FAE5" },
                              { label: "สุริยันอรุณรุ่ง", bg: "#7C2D12", text: "#FFEDD5" },
                              { label: "ศิลาดำดุดัน", bg: "#090503", text: "#ECE5DD" },
                            ].map((themeColor, tIdx) => (
                              <button
                                key={tIdx}
                                type="button"
                                onClick={() => setEditedSettings({
                                  ...editedSettings,
                                  announcementBarBgColor: themeColor.bg,
                                  announcementBarTextColor: themeColor.text
                                })}
                                className="px-2.5 py-1 rounded text-[8.5px] border border-white/5 font-semibold transition-all cursor-pointer"
                                style={{ backgroundColor: themeColor.bg, color: themeColor.text }}
                                disabled={(editedSettings.announcementBarStyle || 'solid') !== 'solid'}
                              >
                                🌟 {themeColor.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Live preview for Marquee */}
                      <div className="bg-slate-900/40 p-4 rounded-xl border border-dashed border-white/10 flex flex-col justify-between space-y-3">
                        <span className="text-[9px] font-bold text-teal-400 block uppercase tracking-wide">🔍 จำลองแถบประกาศจริง (Live Announcement Preview)</span>
                        
                        {/* Simulation Bar */}
                        {(() => {
                          const barStyle = editedSettings.announcementBarStyle || "solid";
                          let previewBg = "border border-white/5";
                          let previewStyles: React.CSSProperties = {};
                          let textStyleSim: React.CSSProperties = {};
                          let isNeon = false;

                          if (barStyle === "solid") {
                            previewStyles = {
                              backgroundColor: editedSettings.announcementBarBgColor || "#8E6D4E",
                              color: editedSettings.announcementBarTextColor || "#FFFFFF"
                            };
                          } else if (barStyle === "gradient-gold") {
                            previewBg += " bg-gradient-to-r from-[#1C1510] via-[#8E6D4E] to-[#1C1510] border-amber-500/20";
                            textStyleSim = { color: "#F6EDE2", textShadow: "0 1px 4px rgba(0,0,0,0.5)" };
                          } else if (barStyle === "neon-glow") {
                            previewBg += " bg-[#070504] border-[#8E6D4E]/20";
                            textStyleSim = { 
                              color: editedSettings.announcementBarBgColor || "#E2C7A9", 
                              textShadow: `0 0 6px ${editedSettings.announcementBarBgColor || "#8E6D4E"}` 
                            };
                            isNeon = true;
                          } else if (barStyle === "glassmorphism") {
                            previewBg += " bg-white/5 border-white/10 backdrop-blur-md";
                            textStyleSim = { color: "#ECE5DD" };
                          }

                          return (
                            <div 
                              className={`w-full rounded-lg py-2.5 px-3 overflow-hidden relative flex items-center gap-2 font-sans font-bold text-[10px] leading-none ${previewBg}`}
                              style={previewStyles}
                            >
                              {editedSettings.announcementBarPrefix && (
                                <div className="flex-shrink-0 bg-black/40 px-1.5 py-0.5 rounded-full border border-white/10 text-[7.5px] uppercase tracking-wider text-[#EAE3DA]">
                                  {editedSettings.announcementBarPrefix}
                                </div>
                              )}
                              <div className="flex-1 overflow-hidden relative h-4 flex items-center">
                                <div 
                                  className="animate-marquee-single flex"
                                  style={{ 
                                    animationDuration: `${editedSettings.announcementBarSpeed || 25}s`,
                                    ...textStyleSim
                                  }}
                                >
                                  <span>{editedSettings.announcementBarText || "ข้อความประกาศวิ่ง..."}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                        
                        <p className="text-[9px] text-stone-400 leading-normal font-light">
                          แถบนี้จะแสดงเป็นลูปเลื่อนไหลต่อเนื่องไม่มีวันสิ้นสุด (Infinite Loop) และหยุดชั่วคราวเมื่อผู้ใช้นำเมาส์ไปชี้เพื่อความสะดวกในการอ่าน
                        </p>
                        <span className="text-[9.5px] text-stone-500 block text-right font-medium">✨ ปรับสปีดและความหรูหราได้ดั่งใจ</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* FLOATING ANIMATED ANNOUNCEMENT CONFIGURATION BLOCK */}
                <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <div>
                      <span className="text-[11px] font-bold text-amber-400 block uppercase tracking-wide">✨ ระบบข้อความประกาศแบบลอยอนิเมชั่นสวยงาม (Premium Floating Animated Announcement)</span>
                      <span className="text-[9.5px] text-slate-400">สร้างป้ายแจ้งเตือนลอยเคลื่อนไหวได้ด้วยฟิสิกส์สปริงตระการตา มีธีมไอคอนพร้อมไฟกะพริบปรับแต่งได้หลังบ้าน</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={!!editedSettings.announcementFloatActive} 
                        onChange={e => setEditedSettings({...editedSettings, announcementFloatActive: e.target.checked})}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                      <span className="ml-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-300">
                        {editedSettings.announcementFloatActive ? "💡 เปิดใช้งาน" : "💤 ซ่อนการแสดงผล"}
                      </span>
                    </label>
                  </div>

                  {editedSettings.announcementFloatActive && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 text-xs">
                      {/* Form Inputs */}
                      <div className="space-y-3">
                        <div>
                          <label className="block mb-1 text-[10px] text-slate-400 font-bold">ข้อความที่ต้องการประกาศ (Announcement Float Text) *</label>
                          <textarea 
                            rows={2}
                            required={editedSettings.announcementFloatActive} 
                            value={editedSettings.announcementFloatText || ""} 
                            onChange={e => setEditedSettings({...editedSettings, announcementFloatText: e.target.value})} 
                            className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white text-xs resize-none" 
                            placeholder="ระบุคำประกาศ เช่น ✨ ข่าวดี! ทางตำบลน้ำน้อยได้เปิดทำเนียบช่างฝีมือปราชญ์ท้องถิ่นครบวงจรแล้ววันนี้..."
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block mb-1 text-[10px] text-slate-400 font-bold">สไตล์ธีมสี (Theme Style)</label>
                            <select
                              value={editedSettings.announcementFloatStyle || "luxury-gold"}
                              onChange={e => setEditedSettings({...editedSettings, announcementFloatStyle: e.target.value as any})}
                              className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white text-[11px]"
                            >
                              <option value="luxury-gold">👑 ทองคำหรูหรา (Luxury Gold)</option>
                              <option value="pastel-orange">🍊 ส้มพาสเทลอุ่น (Pastel Orange)</option>
                              <option value="neon-cyan">💎 นีออนไซเบอร์ (Neon Cyan)</option>
                              <option value="crimson-bold">🔥 แดงดุดันเร้าใจ (Crimson Bold)</option>
                              <option value="emerald-green">🌿 เขียวมรกตออแกนิก (Emerald Green)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block mb-1 text-[10px] text-slate-400 font-bold">สัญลักษณ์ไอคอน (Icon Type)</label>
                            <select
                              value={editedSettings.announcementFloatIcon || "broadcast"}
                              onChange={e => setEditedSettings({...editedSettings, announcementFloatIcon: e.target.value as any})}
                              className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white text-[11px]"
                            >
                              <option value="broadcast">📢 ประกาศ (Broadcast)</option>
                              <option value="welcome">🎉 ยินดีต้อนรับ (Welcome)</option>
                              <option value="sale">⚡ โปรด่วน/พิเศษ (Flash Sale)</option>
                              <option value="winner">🏆 คัดสรร/ผู้ชนะ (Winner)</option>
                              <option value="alert">⚠️ เตือนสำคัญ (Alert)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block mb-1 text-[10px] text-slate-400 font-bold">ตำแหน่งแสดงผล (Position)</label>
                            <select
                              value={editedSettings.announcementFloatPosition || "bottom-right"}
                              onChange={e => setEditedSettings({...editedSettings, announcementFloatPosition: e.target.value as any})}
                              className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white text-[11px]"
                            >
                              <option value="bottom-right">↘️ มุมขวาด้านล่าง</option>
                              <option value="bottom-left">↙️ มุมซ้ายด้านล่าง</option>
                              <option value="top-right">↗️ มุมขวาด้านบน</option>
                              <option value="top-left">↖️ มุมซ้ายด้านบน</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Floating Mini Live Preview */}
                      <div className="bg-slate-900/40 p-3 rounded-xl border border-dashed border-white/10 flex flex-col justify-between">
                        <div>
                          <span className="text-[9px] font-bold text-teal-400 block mb-2 uppercase tracking-wide">🔍 จำลองป้ายประกาศลอยจริง (Animated Floating Preview)</span>
                          
                          <div className="py-2 flex justify-center items-center h-24 bg-slate-950/60 rounded-lg relative overflow-hidden">
                            {/* Animated sample floating card inside admin */}
                            <div className="flex items-center gap-2.5 p-3 rounded-2xl border max-w-xs shadow-lg animate-bounce duration-1000 bg-[#FCFAF7] dark:bg-[#1A1612] border-amber-500/30 text-amber-700 dark:text-[#E2C7A9] shadow-amber-500/5">
                              <span className="text-base flex-shrink-0 animate-pulse">
                                {editedSettings.announcementFloatIcon === 'welcome' ? '🎉' :
                                 editedSettings.announcementFloatIcon === 'sale' ? '⚡' :
                                 editedSettings.announcementFloatIcon === 'winner' ? '🏆' :
                                 editedSettings.announcementFloatIcon === 'alert' ? '⚠️' : '📢'}
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="text-[9px] font-black tracking-widest uppercase opacity-75">
                                  {editedSettings.announcementFloatIcon === 'welcome' ? 'Welcome' :
                                   editedSettings.announcementFloatIcon === 'sale' ? 'Flash Deal' :
                                   editedSettings.announcementFloatIcon === 'winner' ? 'Special Selection' :
                                   editedSettings.announcementFloatIcon === 'alert' ? 'Important Notice' : 'Broadcast'}
                                </div>
                                <div className="text-[10px] font-medium leading-tight truncate">
                                  {editedSettings.announcementFloatText || "ข้อความจำลองประกาศของคุณหลังบ้าน..."}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <span className="text-[9.5px] text-stone-500 block text-right">ป้ายนี้จะแสดงในหน้าแรก ลอยอย่างสวยงามและเป็นธรรมชาติ</span>
                      </div>
                    </div>
                  )}

                  {/* LUXURY PRODUCT RECOMMENDATION SLIDER CONFIGURATION */}
                  <div className="col-span-2 border-t border-white/5 pt-4 mt-2">
                    <span className="text-[11px] font-bold text-amber-400 block mb-2 uppercase tracking-wide">🌟 ระบบแดชบอร์ดแนะนำสินค้าหรูหราหน้าเว็บ (Luxury Recommended Slider Dashboard)</span>
                    <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 space-y-4">
                      
                      <div className="flex items-center justify-between bg-slate-950/40 p-3 rounded-xl border border-white/5">
                        <div>
                          <label className="text-[10.5px] font-bold text-slate-300 block">เปิดใช้งานสไลเดอร์สินค้าแนะนำ (Enable Recommendation Slider)</label>
                          <span className="text-[9px] text-slate-500">แสดงแผงสไลเดอร์เลื่อนหรูหราบริเวณเหนือหัวข้อหมวดหมู่สินค้าในหน้าแรก</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={!!editedSettings.recommendActive} 
                            onChange={e => setEditedSettings({...editedSettings, recommendActive: e.target.checked})} 
                            className="sr-only peer" 
                          />
                          <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                        </label>
                      </div>

                      {editedSettings.recommendActive && (
                        <div className="space-y-3 animate-fadeIn">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block mb-1 text-[10px] text-slate-400">หัวข้อบอร์ดแนะนำภาษาไทย (Slider Title - Thai) *</label>
                              <input 
                                type="text" 
                                required 
                                value={editedSettings.recommendTitle || "🌟 สินค้าแนะนำพิเศษ"} 
                                onChange={e => setEditedSettings({...editedSettings, recommendTitle: e.target.value})} 
                                className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white" 
                                placeholder="เช่น 🌟 สินค้าแนะนำพิเศษ"
                              />
                            </div>
                            <div>
                              <label className="block mb-1 text-[10px] text-slate-400">คำอธิบายใต้หัวข้อ (Slider Subtitle - Thai) *</label>
                              <input 
                                type="text" 
                                required 
                                value={editedSettings.recommendSubtitle || "คัดสรรสุดยอดหัตถศิลป์ระดับพรีเมียมของชุมชนน้ำน้อยที่ได้รับความนิยมสูง"} 
                                onChange={e => setEditedSettings({...editedSettings, recommendSubtitle: e.target.value})} 
                                className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white" 
                                placeholder="เช่น คัดสรรสุดยอดหัตถศิลป์ระดับพรีเมียมของชุมชน..."
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-400 font-bold mb-1.5">🎯 เลือกสินค้าที่ต้องการแนะนำ (คลิกเพื่อเลือก/ยกเลิกนำขึ้นสไลเดอร์แนะนำสินค้า):</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                              {products.map((prod) => {
                                const currentRecs = editedSettings.recommendProductIds || [];
                                const isSelected = currentRecs.includes(prod.id);
                                return (
                                  <div 
                                    key={prod.id} 
                                    onClick={() => {
                                      let nextRecs = [...currentRecs];
                                      if (isSelected) {
                                        nextRecs = nextRecs.filter(id => id !== prod.id);
                                      } else {
                                        nextRecs.push(prod.id);
                                      }
                                      setEditedSettings({...editedSettings, recommendProductIds: nextRecs});
                                    }}
                                    className={`flex items-center gap-2.5 p-2 rounded-xl border cursor-pointer select-none transition-all ${
                                      isSelected 
                                        ? "bg-amber-500/10 border-amber-500/40 text-white" 
                                        : "bg-slate-950/40 border-white/5 text-slate-400 hover:border-white/10 hover:bg-slate-900/40"
                                    }`}
                                  >
                                    <input 
                                      type="checkbox" 
                                      checked={isSelected}
                                      onChange={() => {}} // Controlled by outer card tap
                                      className="rounded bg-slate-950 border-white/10 text-amber-500 focus:ring-amber-500 focus:ring-offset-slate-900" 
                                    />
                                    <img src={prod.imageUrl} alt={prod.name} className="w-8 h-8 object-cover rounded bg-stone-900 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                      <div className="text-[10px] font-bold text-slate-200 truncate">{prod.name}</div>
                                      <div className="text-[9px] text-[#8E6D4E] font-medium">{prod.price} ฿</div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            <span className="text-[9px] text-stone-500 block mt-1.5">มีทั้งหมด {products.length} รายการ | แนะนำสินค้าไปแล้ว {(editedSettings.recommendProductIds || []).length} รายการ</span>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>

                  {/* RECENT ORDERS TICKER CONFIGURATION */}
                  <div className="col-span-2 border-t border-white/5 pt-4 mt-2">
                    <span className="text-[11px] font-bold text-violet-400 block mb-2 uppercase tracking-wide">🛒 ระบบแสดงรายการสั่งซื้อล่าสุดเลื่อนอัตโนมัติ (Live Recent Orders Ticker)</span>
                    <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 space-y-4">
                      
                      <div className="flex items-center justify-between bg-slate-950/40 p-3 rounded-xl border border-white/5">
                        <div>
                          <label className="text-[10.5px] font-bold text-slate-300 block">เปิดใช้งานระบบรายการสั่งซื้อล่าสุดเลื่อนไปเรื่อย ๆ (Enable Recent Orders Ticker)</label>
                          <span className="text-[9px] text-slate-500">แสดงผลแถบรายการสั่งซื้อล่าสุดเคลื่อนไหวอัตโนมัติในสไตล์หรูหราที่หน้าแรก</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={!!editedSettings.recentOrdersActive} 
                            onChange={e => setEditedSettings({...editedSettings, recentOrdersActive: e.target.checked})} 
                            className="sr-only peer" 
                          />
                          <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-violet-500"></div>
                        </label>
                      </div>

                      {editedSettings.recentOrdersActive && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 animate-fadeIn">
                          <div>
                            <label className="block mb-1 text-[10px] text-slate-400">เลือกโทนสีและการตกแต่งกล่องสั่งซื้อ (Ticker Visual Theme Style)</label>
                            <select 
                              value={editedSettings.recentOrdersStyle || "violet-indigo"} 
                              onChange={e => setEditedSettings({...editedSettings, recentOrdersStyle: e.target.value as any})} 
                              className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white text-xs"
                            >
                              <option value="violet-indigo">👾 Violet & Indigo (นีออนม่วง-ครามหรูหรา)</option>
                              <option value="sunset-orange">🌅 Sunset Orange (ส้มพระอาทิตย์อัสดง นำโชค)</option>
                              <option value="emerald-green">🌿 Emerald Green (เขียวมรกตธรรมชาติ สดชื่น)</option>
                              <option value="crimson-rose">💖 Crimson Rose (แดงระเรื่อชมพูโรส มีเสน่ห์)</option>
                              <option value="luxury-gold">✨ Luxury Gold (ทองคำอร่ามหรูหรา ระดับพรีเมียม)</option>
                              <option value="cyberpunk-neon">⚡ Cyberpunk Neon (แสงไซเบอร์พังก์ ล้ำสมัยสีสันจัดเต็ม)</option>
                              <option value="glass-monochrome">💎 Glass Monochrome (กระจกใสโมโนโครม คลาสสิกร่วมสมัย)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block mb-1 text-[10px] text-slate-400">ระดับความเร็วในการเลื่อนช่องประกาศ (Ticker Scroll Speed)</label>
                            <select 
                              value={editedSettings.recentOrdersSpeed || "normal"} 
                              onChange={e => setEditedSettings({...editedSettings, recentOrdersSpeed: e.target.value as any})} 
                              className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white text-xs"
                            >
                              <option value="slow">🐌 Slow (เลื่อนช้า - เน้นให้อ่านง่าย สบายตา)</option>
                              <option value="normal">🚶 Normal (ความเร็วปกติ - พอดีเป็นธรรมชาติ)</option>
                              <option value="fast">🏃 Fast (เลื่อนเร็ว - สตรีมสดคึกคักเห็นความถี่)</option>
                              <option value="vfast">⚡ Very Fast (เลื่อนด่วนพิเศษ - ประกาศข่าวรวดเร็วเต็มพลัง)</option>
                            </select>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>

                  {/* SITE MAINTENANCE CONFIGURATION */}
                  <div className="col-span-2 border-t border-white/5 pt-4 mt-2">
                    <span className="text-[11px] font-bold text-amber-500 block mb-2 uppercase tracking-wide">🔧 ระบบปรับปรุงเว็บไซต์ชั่วคราว (Site Maintenance Mode)</span>
                    <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 space-y-4">
                      
                      <div className="flex items-center justify-between bg-slate-950/40 p-3 rounded-xl border border-white/5">
                        <div>
                          <label className="text-[10.5px] font-bold text-slate-300 block">เปิดใช้งานโหมดปรับปรุงเว็บไซต์ (Enable Maintenance Mode)</label>
                          <span className="text-[9px] text-slate-500">หากเปิดใช้งาน คนทั่วไปจะไม่สามารถเข้าถึงหน้าเว็บได้ ยกเว้นแอดมิน เพื่อความปลอดภัยในการอัปเดตระบบ</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={!!editedSettings.maintenanceActive} 
                            onChange={e => setEditedSettings({...editedSettings, maintenanceActive: e.target.checked})} 
                            className="sr-only peer" 
                          />
                          <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                        </label>
                      </div>

                      {editedSettings.maintenanceActive && (
                        <div className="grid grid-cols-1 gap-3.5 animate-fadeIn">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div>
                              <label className="block mb-1 text-[10px] text-slate-400">หัวข้อหน้าปรับปรุงระบบ (Maintenance Title)</label>
                              <input 
                                type="text"
                                value={editedSettings.maintenanceTitle || ""}
                                onChange={e => setEditedSettings({...editedSettings, maintenanceTitle: e.target.value})}
                                className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-white text-xs"
                                placeholder="🔧 อยู่ระหว่างปรับปรุงระบบชั่วคราว..."
                              />
                            </div>
                            <div>
                              <label className="block mb-1 text-[10px] text-slate-400">ระยะเวลาโดยประมาณ (Estimated Completion Time)</label>
                              <input 
                                type="text"
                                value={editedSettings.maintenanceEstimatedTime || ""}
                                onChange={e => setEditedSettings({...editedSettings, maintenanceEstimatedTime: e.target.value})}
                                className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-white text-xs"
                                placeholder="ประมาณ 2 ชั่วโมง หรือ คาดว่าจะเสร็จเวลา 18:00 น."
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block mb-1 text-[10px] text-slate-400">รายละเอียดแจ้งลูกค้า (Maintenance Notification Message)</label>
                            <textarea
                              value={editedSettings.maintenanceMessage || ""}
                              onChange={e => setEditedSettings({...editedSettings, maintenanceMessage: e.target.value})}
                              className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-white text-xs h-20 resize-none"
                              placeholder="ระบุข้อความชี้แจงผู้ใช้งานขณะระบบปิดปรับปรุง..."
                            />
                          </div>

                          <div className="bg-slate-950/40 p-3.5 rounded-xl border border-white/5 space-y-2">
                            <label className="block text-[10.5px] font-bold text-amber-400 flex items-center gap-1.5">
                              📅 ตั้งเวลาเปิดเว็บไซต์อัตโนมัติ (Auto-Open Scheduled Time)
                            </label>
                            <p className="text-[9px] text-slate-500">หากกำหนดค่าระบบจะตรวจสอบเมื่อผู้ใช้นำเข้าหน้าเว็บ หากถึงหรือเลยเวลาที่กำหนด โหมดปรับปรุงเว็บไซต์จะเปิดให้บริการโดยอัตโนมัติทันที</p>
                            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                              <input 
                                type="datetime-local"
                                value={editedSettings.maintenanceAutoOpenTime || ""}
                                onChange={e => setEditedSettings({...editedSettings, maintenanceAutoOpenTime: e.target.value})}
                                className="w-full sm:w-auto bg-slate-900 border border-white/10 rounded-lg p-2 text-white text-xs font-mono select-none"
                                style={{ colorScheme: 'dark' }}
                              />
                              {editedSettings.maintenanceAutoOpenTime && (
                                <button
                                  type="button"
                                  onClick={() => setEditedSettings({...editedSettings, maintenanceAutoOpenTime: ""})}
                                  className="text-[10px] text-red-400 hover:text-red-300 transition-colors underline cursor-pointer self-center sm:ml-2"
                                >
                                  ยกเลิกการตั้งเวลาเปิดอัตโนมัติ
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button type="submit" className="bg-gradient-to-r from-teal-500 to-emerald-400 text-slate-950 font-bold py-2.5 px-6 rounded-xl hover:scale-102 transition-all">บันทึกการตั้งค่าทั้งสิ้น</button>
                </div>
              </form>

              {/* BACKUP & RESTORE SECTION */}
              <div className="mt-8 bg-slate-950/40 p-5 rounded-2xl border border-white/5 space-y-4 text-xs">
                <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                  <Database size={16} className="text-teal-400" />
                  <div>
                    <h4 className="font-extrabold text-sm text-white uppercase tracking-wider">🗄️ ระบบสำรองและกู้คืนข้อมูลร้านค้า (Store Database Backup & Restore)</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">ปกป้องข้อมูลของคุณจากการรีเซ็ตเมื่อรีสตาร์ทเซิร์ฟเวอร์ หรือนำข้อมูลไปกู้คืนเมื่อเปิดใช้งานเว็บใหม่</p>
                  </div>
                </div>

                {backupSuccessMsg && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl font-bold text-xs">
                    {backupSuccessMsg}
                  </div>
                )}

                {backupErrorMsg && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl font-bold text-xs">
                    {backupErrorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {/* DOWNLOAD SECTION */}
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-white/5 flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <span className="text-[11px] font-extrabold text-teal-400 block uppercase">1. ดาวน์โหลดข้อมูลสำรอง (Export)</span>
                      <p className="text-[10.5px] text-slate-400">บันทึกโครงสร้างร้านค้าทั้งหมด ได้แก่ ผลิตภัณฑ์, หมวดหมู่, คูปอง, สมาชิก, รายการสั่งซื้อ และการตั้งค่าร้านค้า ทั้งหมดลงในเครื่องคอมพิวเตอร์ของคุณในรูปแบบไฟล์เดียว (.json)</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadBackup}
                      disabled={backupLoading}
                      className="w-full bg-slate-900 hover:bg-slate-850 border border-teal-500/30 text-teal-300 font-extrabold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Database size={14} />
                      {backupLoading ? "กำลังประมวลผล..." : "ดาวน์โหลดข้อมูลสำรองทันที"}
                    </button>
                  </div>

                  {/* UPLOAD SECTION */}
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-white/5 flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <span className="text-[11px] font-extrabold text-amber-400 block uppercase">2. กู้คืนข้อมูลผ่านไฟล์สำรอง (Import / Restore)</span>
                      <p className="text-[10.5px] text-slate-400">เลือกไฟล์ข้อมูลสำรอง (.json) ที่เคยดาวน์โหลดไว้เพื่อเขียนทับและกู้คืนระบบหลังบ้านทั้งหมดกลับมาทำงานในเซิร์ฟเวอร์นี้ทันที</p>
                    </div>
                    <label className="w-full bg-gradient-to-r from-amber-600/20 to-red-600/20 hover:from-amber-600/30 hover:to-red-600/30 border border-amber-500/30 text-amber-300 font-extrabold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-center disabled:opacity-50">
                      <Upload size={14} />
                      <span>{backupLoading ? "กำลังอัปโหลด..." : "เลือกไฟล์สำรองข้อมูล (.json)"}</span>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleUploadBackup}
                        disabled={backupLoading}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-[10.5px] text-slate-400 leading-relaxed">
                  💡 <strong className="text-white">ระบบสำรองข้อมูลเบราว์เซอร์อัตโนมัติ (LocalStorage Auto-Backup):</strong> ทุกครั้งที่คุณทำการปรับแต่งข้อมูลหลังบ้านหรือเพิ่มสินค้า ระบบจะแอบสำรองข้อมูลที่ปลอดภัยไว้ในเบราว์เซอร์นี้โดยอัตโนมัติ หากเว็ปไซต์เกิดขัดข้องหรือรีสตาร์ท คุณจะได้รับการแจ้งเตือนให้กดกู้คืนทันทีใน 1 วินาทีเมื่อเปิดหน้าเว็ป
                </div>
              </div>
            </>
          )}

            {/* Orders & Shipping Tracking tab */}
            {activeTab === "orders" && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-[#1e1e24] border border-white/5 text-slate-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Truck className="text-amber-500" size={16} />
                      <h4 className="font-extrabold text-white uppercase tracking-wider">ระบบจัดการคำสั่งซื้อและการจัดส่งพัสดุ (Order & Fulfillment Tracking)</h4>
                    </div>
                    <button 
                      type="button"
                      onClick={fetchTransactions}
                      className="p-1.5 px-3 bg-white/5 hover:bg-white/10 text-[10px] text-slate-300 rounded-lg flex items-center gap-1 cursor-pointer transition-all border border-white/5"
                    >
                      <RefreshCw size={11} className={txLoading ? "animate-spin" : ""} />
                      <span>รีเฟรชข้อมูล</span>
                    </button>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-1.5 leading-relaxed">
                    คุณสามารถตรวจสอบรายการคำสั่งซื้อสินค้าและพัสดุจากลูกค้าทั้งหมดได้ที่นี่ ระบุเลขพัสดุ (Tracking Number) เพื่อให้ลูกค้าสามารถเช็คสถานะการจัดส่งได้แบบเรียลไทม์จากเมนูประวัติการซื้อค่ะ
                  </p>
                </div>

                {txLoading ? (
                  <div className="text-center py-12 text-slate-500 font-bold">กำลังดาวน์โหลดข้อมูลรายการสั่งซื้อพัสดุ...</div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-950/40">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-950/80 border-b border-white/5 text-[10px] text-slate-400 uppercase font-black">
                          <th className="p-3 text-center">วันที่สั่งซื้อ</th>
                          <th className="p-3">รหัสสั่งซื้อ/ลูกค้า</th>
                          <th className="p-3">รายการสินค้า</th>
                          <th className="p-3 text-right">ยอดรวม (฿)</th>
                          <th className="p-3">ข้อมูลผู้รับ & วิธีจัดส่ง</th>
                          <th className="p-3 text-center">สถานะ</th>
                          <th className="p-3">เลขพัสดุ</th>
                          <th className="p-3 text-center">จัดการ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.03]">
                        {transactions
                          .filter((tx: any) => tx.type.startsWith("purchase_"))
                          .map((tx: any) => {
                            const isUpdating = updatingTxId === tx.id;
                            const hasShippedInfo = tx.shippingDetails;
                            
                            return (
                              <tr key={tx.id} className="hover:bg-white/[0.01] transition-all">
                                <td className="p-3 text-stone-400 text-center font-mono text-[10px] whitespace-nowrap">
                                  {new Date(tx.date).toLocaleString("th-TH", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })}
                                </td>
                                <td className="p-3">
                                  <div className="font-mono text-[10px] text-amber-500 font-bold">{tx.id}</div>
                                  <div className="text-slate-300 font-semibold">@ {tx.username}</div>
                                </td>
                                <td className="p-3 max-w-[200px]">
                                  <div className="text-slate-200 font-medium line-clamp-2 leading-relaxed">
                                    {tx.details}
                                  </div>
                                </td>
                                <td className="p-3 text-right text-emerald-400 font-black font-mono">
                                  {tx.amount.toLocaleString()} ฿
                                </td>
                                <td className="p-3 max-w-[240px]">
                                  {hasShippedInfo ? (
                                    <div className="space-y-1 bg-slate-900/60 p-2 rounded-lg border border-white/5 text-[11px] text-slate-300">
                                      <div className="font-bold text-white flex items-center gap-1">
                                        👤 {tx.shippingDetails.name}
                                      </div>
                                      <div>📞 {tx.shippingDetails.phone}</div>
                                      <div className="text-slate-400 line-clamp-2">📍 {tx.shippingDetails.address}, {tx.shippingDetails.zip}</div>
                                      <div className="text-stone-400 text-[10px] bg-slate-950/60 py-0.5 px-1.5 rounded inline-block">
                                        🚚 {tx.shippingDetails.method}
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-slate-500 font-medium">ไม่มีการระบุข้อมูลจัดส่ง (ซื้อแบบสินค้าดิจิทัล/สุ่มกล่องปกติ)</span>
                                  )}
                                </td>
                                <td className="p-3 text-center whitespace-nowrap">
                                  {tx.orderStatus ? (
                                    <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${
                                      tx.orderStatus === 'preparing' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                      tx.orderStatus === 'shipped' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                      tx.orderStatus === 'delivered' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                      'bg-red-500/10 text-red-400 border border-red-500/20'
                                    }`}>
                                      {tx.orderStatus === 'preparing' ? '📦 กำลังเตรียมส่ง' :
                                       tx.orderStatus === 'shipped' ? '🚚 ส่งแล้ว' :
                                       tx.orderStatus === 'delivered' ? '✅ สำเร็จ' :
                                       '❌ ยกเลิก'}
                                    </span>
                                  ) : (
                                    <span className="text-slate-500 font-medium">จัดส่งสำเร็จดิจิทัล</span>
                                  )}
                                </td>
                                <td className="p-3 font-mono">
                                  {tx.trackingNumber ? (
                                    <div className="space-y-0.5">
                                      <span className="text-[10px] text-slate-400 bg-slate-900 py-0.5 px-1.5 rounded border border-white/5">
                                        {tx.trackingCarrier || "Flash Express"}
                                      </span>
                                      <div className="text-[11px] font-black text-white">{tx.trackingNumber}</div>
                                    </div>
                                  ) : tx.orderStatus ? (
                                    <span className="text-slate-500 italic">ยังไม่มีเลขพัสดุ</span>
                                  ) : (
                                    <span className="text-slate-500">-</span>
                                  )}
                                </td>
                                <td className="p-3 text-center">
                                  {tx.orderStatus ? (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (isUpdating) {
                                          setUpdatingTxId(null);
                                        } else {
                                          setUpdatingTxId(tx.id);
                                          setTrackingForm({
                                            orderStatus: tx.orderStatus || "preparing",
                                            trackingNumber: tx.trackingNumber || "",
                                            trackingCarrier: tx.trackingCarrier || "",
                                            note: ""
                                          });
                                        }
                                      }}
                                      className={`p-1 px-2.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                        isUpdating 
                                          ? "bg-slate-800 text-white" 
                                          : "bg-amber-500 text-slate-950 hover:opacity-90"
                                      }`}
                                    >
                                      {isUpdating ? "ปิดฟอร์ม" : "อัปเดตพัสดุ"}
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setUpdatingTxId(tx.id);
                                        setTrackingForm({
                                          orderStatus: "preparing",
                                          trackingNumber: "",
                                          trackingCarrier: "",
                                          note: ""
                                        });
                                      }}
                                      className="p-1 px-2.5 rounded-lg text-[10px] bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-bold transition-all cursor-pointer"
                                    >
                                      เปิดส่งพัสดุ
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        {transactions.filter((tx: any) => tx.type.startsWith("purchase_")).length === 0 && (
                          <tr>
                            <td colSpan={8} className="p-8 text-center text-slate-500">
                              ยังไม่มีรายการสั่งซื้อใดๆ ในขณะนี้
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Tracking edit form drawer popup (Inline below table or highlighted) */}
                {updatingTxId && (
                  <div className="bg-[#1e1e24] p-4 rounded-2xl border border-amber-500/20 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-amber-400 block uppercase tracking-wide">📦 อัปเดตข้อมูลพัสดุ & สถานะจัดส่ง (Fulfill Order: #{updatingTxId})</span>
                      <button 
                        type="button"
                        onClick={() => setUpdatingTxId(null)}
                        className="text-[10px] text-slate-400 hover:text-white"
                      >
                        ยกเลิก
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1 font-bold">ขั้นตอนสถานะสินค้า (Fulfillment Stage) *</label>
                        <select
                          value={trackingForm.orderStatus}
                          onChange={e => setTrackingForm({...trackingForm, orderStatus: e.target.value as any})}
                          className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white text-xs"
                        >
                          <option value="preparing">📦 Preparing (กำลังจัดเตรียมพัสดุและกล่องสินค้า)</option>
                          <option value="shipped">🚚 Shipped (จัดส่งแล้ว / มอบของให้บริษัทขนส่ง)</option>
                          <option value="delivered">✅ Delivered (จัดส่งสำเร็จแก่ผู้รับเรียบร้อย)</option>
                          <option value="cancelled">❌ Cancelled (ยกเลิกรายการสั่งซื้อ / คืนเงิน)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1 font-bold">บริษัทขนส่ง (Logistics Carrier)</label>
                        <input
                          type="text"
                          placeholder="ตัวอย่าง: Flash Express, Kerry, J&T, EMS ไปรษณีย์ไทย"
                          value={trackingForm.trackingCarrier}
                          onChange={e => setTrackingForm({...trackingForm, trackingCarrier: e.target.value})}
                          className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1 font-bold">เลขพัสดุ (Tracking Number)</label>
                        <input
                          type="text"
                          placeholder="ตัวอย่าง: TH123456789A"
                          value={trackingForm.trackingNumber}
                          onChange={e => setTrackingForm({...trackingForm, trackingNumber: e.target.value})}
                          className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1 font-bold">รายละเอียด/หมายเหตุการจัดส่ง (Shipping Status Notes / Details)</label>
                      <input
                        type="text"
                        placeholder="ระบุข้อความสั้นๆ เช่น 'พนักงานมารับสินค้าแล้ว คาดว่าจะถึงปลายทางใน 1-2 วันค่ะ' หรือเว้นว่างได้"
                        value={trackingForm.note}
                        onChange={e => setTrackingForm({...trackingForm, note: e.target.value})}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white text-xs"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setUpdatingTxId(null)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all cursor-pointer"
                      >
                        ยกเลิก
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateTrackingSubmit(updatingTxId)}
                        className="px-5 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:opacity-90 text-slate-950 font-black rounded-xl transition-all cursor-pointer shadow-lg"
                      >
                        บันทึกการจัดส่งพัสดุ +
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* T6: The majestic PHP Exporter tab */}
            {activeTab === "php-exporter" && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-950/80 to-slate-950 border border-teal-500/20 text-slate-300 text-xs leading-relaxed space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Code className="text-emerald-400" size={16} />
                    <h4 className="font-extrabold text-[#ffffff] uppercase tracking-wider">ตัวสร้างสคริปต์ระบบ PHP (PDO) แบบพรีเมียมออโต้โอน</h4>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    ปรับเซ็ตค่าทางแอดมินด้านบนให้พึงพอใจแล้ว จากนั้นนำชุดซอร์สโค้ด PHP (PDO / OOP) คุณภาพสูงเหล่านี้ไปอัปโหลดเปิดใช้งานลงในเซิร์ฟเวอร์โฮสติ้งหลักของคุณได้ทันที! ทุกสิ่งเชื่อมและพรีเซ็ตให้สอดคล้องกันอย่างปลอดภัย <strong>มีความสม่ำเสมอของระบบ ปลอดภัย และป้องกัน SQL Injection สูงล้ำ</strong>
                  </p>
                </div>

                {/* Grid file tabs inside PHP explorer */}
                <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-xl">
                  {exporterFiles.map((file, idx) => (
                    <button
                      key={file.name}
                      onClick={() => setActiveFileTab(idx)}
                      className={`py-2 text-[10px] font-mono font-bold rounded-lg transition-all cursor-pointer ${
                        activeFileTab === idx ? "bg-slate-900 text-teal-400 border border-white/10" : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      📄 {file.name}
                    </button>
                  ))}
                </div>

                {/* Exporter Selected Code Area with Copy tool */}
                {exporterFiles.length > 0 && (
                  <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-slate-950 group">
                    <div className="flex items-center justify-between px-4 py-2 bg-slate-900/60 border-b border-white/5">
                      <span className="text-[10px] font-mono text-slate-400">ไฟล์รหัสต้นฉบับ: {exporterFiles[activeFileTab].name}</span>
                      <button
                        onClick={() => handleCopyCode(exporterFiles[activeFileTab].content, activeFileTab)}
                        className="p-1 px-2.5 rounded-md bg-white/5 hover:bg-white/10 text-[10px] text-slate-300 flex items-center gap-1 cursor-pointer transition-all"
                      >
                        {copiedFileIndex === activeFileTab ? (
                          <>
                            <Check size={11} className="text-emerald-400" />
                            <span className="text-emerald-400">คัดลอกแล้ว +</span>
                          </>
                        ) : (
                          <>
                            <Copy size={11} />
                            <span>คัดลอกโค้ดไปใช้</span>
                          </>
                        )}
                      </button>
                    </div>

                    <pre className="p-4 text-[10px] font-mono text-slate-300 bg-slate-950 overflow-auto max-h-72 leading-relaxed tab-size-4 select-all selection:bg-teal-500/20">
                      <code>{exporterFiles[activeFileTab].content}</code>
                    </pre>
                  </div>
                )}

                {/* PHP instructions and SQL Schemas */}
                <div className="p-4 rounded-xl bg-slate-950 border border-dashed border-white/10">
                  <h5 className="text-[11px] font-extrabold text-white mb-2 uppercase tracking-wide">📦 วิธีการเตรียมตาราง SQL (Import schema):</h5>
                  <div className="max-h-56 overflow-y-auto pr-1">
                    <pre className="text-[9px] font-mono text-slate-400 bg-slate-900 p-3 rounded-lg leading-relaxed select-all">
                      <code>{`CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50) DEFAULT 'Folder',
  imageUrl VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(50) PRIMARY KEY,
  category_id VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  imageUrl VARCHAR(255),
  stock_data JSON,
  timesSold INT DEFAULT 0,
  details TEXT,
  type VARCHAR(20) DEFAULT 'normal'
);

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL,
  balance DECIMAL(10, 2) DEFAULT 0.00,
  role VARCHAR(20) DEFAULT 'user',
  discord_id VARCHAR(100),
  avatar_url VARCHAR(255),
  password_hash VARCHAR(255)
);`}</code>
                    </pre>
                  </div>
                </div>

              </div>
            )}

            {/* Seller Verifications (Admin tab) */}
            {activeTab === "seller-verifications" && (
              <div className="space-y-4 text-xs h-full overflow-y-auto pr-1">
                <div className="p-4 rounded-2xl bg-[#1e1e24] border border-white/5 text-slate-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="text-amber-500" size={16} />
                      <h4 className="font-extrabold text-white uppercase tracking-wider">ระบบอนุมัติยืนยันตัวตนผู้ขาย (Seller Identity Verification)</h4>
                    </div>
                    <button 
                      type="button"
                      onClick={fetchVerifications}
                      className="p-1.5 px-3 bg-white/5 hover:bg-white/10 text-[10px] text-slate-300 rounded-lg flex items-center gap-1 cursor-pointer transition-all border border-white/5"
                    >
                      <RefreshCw size={11} className={verificationsLoading ? "animate-spin" : ""} />
                      <span>รีเฟรชคำขอ</span>
                    </button>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-1.5 leading-relaxed">
                    ที่นี่คือแผงควบคุมสำหรับพิจารณาคุณสมบัติผู้ขายที่ยื่นเอกสารตัวตนเข้ามาในระบบ หากอนุมัติ บทบาทของผู้ใช้จะเปลี่ยนเป็นผู้ขายทันทีค่ะ
                  </p>
                </div>

                {verificationsLoading ? (
                  <div className="text-center py-12 text-slate-500 font-bold">กำลังดาวน์โหลดข้อมูลผู้สมัคร KYC...</div>
                ) : sellerVerifications.length === 0 ? (
                  <div className="p-10 text-center rounded-2xl border border-dashed border-white/10 bg-slate-900/30 text-slate-500">
                    ยังไม่มีผู้ใช้รายใดยื่นเอกสารเพื่อขออนุมัติเป็นผู้ขายในขณะนี้
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {sellerVerifications.map((v: any) => {
                      return (
                        <div key={v.id} className="p-5 rounded-2xl bg-slate-900/40 border border-white/10 space-y-4">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-white/5 pb-3">
                            <div>
                              <span className="text-[10px] uppercase font-bold tracking-wider text-teal-400 bg-teal-400/10 px-2 py-0.5 rounded-md mr-2">
                                {v.sellerType === "internal" ? "ผู้ขายภายในระบบ (Internal)" : "ผู้ขายภายนอกชุมชน (External)"}
                              </span>
                              <h5 className="text-white text-sm font-bold inline-block">{v.shopName}</h5>
                              <p className="text-slate-400 text-[11px] mt-0.5">{v.shopDescription}</p>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              v.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                              v.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                              'bg-red-500/10 text-red-500 border border-red-500/20'
                            }`}>
                              {v.status === 'pending' ? '⏳ รอการตรวจสอบ' :
                               v.status === 'approved' ? '✓ อนุมัติผ่านเกณฑ์' : '✗ ปฏิเสธการอนุมัติ'}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300">
                            <div className="space-y-1.5">
                              <p><strong className="text-slate-400">ผู้ยื่นคำขอ:</strong> {v.username} (ID: {v.userId})</p>
                              <p><strong className="text-slate-400">ชื่อ-นามสกุลจริง:</strong> {v.fullName}</p>
                              <p><strong className="text-slate-400">เลขบัตรประชาชน/ใบอนุญาต:</strong> {v.citizenId}</p>
                              <p><strong className="text-slate-400">เบอร์โทรศัพท์ติดต่อ:</strong> {v.phone}</p>
                            </div>
                            <div className="space-y-1.5">
                              <p><strong className="text-slate-400">ธนาคารสำหรับถอนเงิน:</strong> {v.bankName}</p>
                              <p><strong className="text-slate-400">ชื่อบัญชีธนาคาร:</strong> {v.bankAccountName}</p>
                              <p><strong className="text-slate-400">เลขบัญชีธนาคาร:</strong> {v.bankAccountNumber}</p>
                              <p><strong className="text-slate-400">เวลายื่นคำขอ:</strong> {new Date(v.submittedAt).toLocaleString('th-TH')}</p>
                            </div>
                          </div>

                          {v.idCardPhotoUrl && (
                            <div className="p-2 bg-slate-950/40 rounded-xl border border-white/5 inline-block">
                              <p className="text-[10px] text-slate-400 mb-1">ภาพหลักฐานยืนยันตัวตน (ID Card/Registration Photo):</p>
                              <img 
                                src={v.idCardPhotoUrl} 
                                alt="ID Verification" 
                                className="max-h-40 rounded-lg object-contain border border-white/10"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          )}

                          {v.status === "pending" || editingVrfId === v.id ? (
                            <div className="pt-2 border-t border-white/5 space-y-3">
                              <div>
                                <label className="block text-[10px] text-slate-400 mb-1 font-bold">ความคิดเห็น/บันทึกแอดมิน (Admin Notes):</label>
                                <textarea 
                                  id={`note-${v.id}`}
                                  placeholder="ระบุหมายเหตุ เช่น 'เอกสารครบถ้วน ผ่านเกณฑ์ประเมิน' หรือ 'รูปบัตรประชาชนไม่ชัดเจน กรุณายื่นสมัครใหม่'"
                                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500/40"
                                  rows={2}
                                  defaultValue={v.adminNotes || ""}
                                />
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const noteVal = (document.getElementById(`note-${v.id}`) as HTMLTextAreaElement)?.value || "";
                                    handleReviewVerification(v.id, "approved", noteVal);
                                  }}
                                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-emerald-600/15"
                                >
                                  <Check size={14} />
                                  <span>อนุมัติคำขอ (Approve)</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const noteVal = (document.getElementById(`note-${v.id}`) as HTMLTextAreaElement)?.value || "";
                                    if (!noteVal) {
                                      showCustomAlert("กรุณาระบุหมายเหตุ", "คุณต้องระบุสาเหตุที่ปฏิเสธเพื่อแจ้งให้ผู้สมัครทราบด้วยค่ะ", "error");
                                      return;
                                    }
                                    handleReviewVerification(v.id, "rejected", noteVal);
                                  }}
                                  className="px-4 py-2 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-red-600/15"
                                >
                                  <X size={14} />
                                  <span>ปฏิเสธคำขอ (Reject)</span>
                                </button>
                                {editingVrfId === v.id && (
                                  <button
                                    type="button"
                                    onClick={() => setEditingVrfId(null)}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all cursor-pointer"
                                  >
                                    ยกเลิก
                                  </button>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 text-[11px] space-y-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div className="space-y-1">
                                <p><strong className="text-slate-400">ตรวจสอบโดยแอดมินเมื่อ:</strong> {new Date(v.reviewedAt).toLocaleString('th-TH')}</p>
                                <p><strong className="text-slate-400">บันทึกของแอดมิน:</strong> <span className="text-amber-400">{v.adminNotes || "ไม่มีหมายเหตุ"}</span></p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setEditingVrfId(v.id)}
                                className="self-start sm:self-center px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 font-bold rounded-lg border border-white/5 transition-all cursor-pointer text-[10px]"
                              >
                                ✎ แก้ไขผลการพิจารณา / ตรวจสอบอีกครั้ง
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Admin Withdrawals (Admin tab) */}
            {activeTab === "admin-withdrawals" && (
              <div className="space-y-4 text-xs h-full overflow-y-auto pr-1">
                <div className="p-4 rounded-2xl bg-[#1e1e24] border border-white/5 text-slate-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gift className="text-emerald-500" size={16} />
                      <h4 className="font-extrabold text-white uppercase tracking-wider">ระบบอนุมัติการถอนเงินรายได้ผู้ขาย (Seller Withdrawal Requests Review)</h4>
                    </div>
                    <button 
                      type="button"
                      onClick={fetchAdminWithdrawals}
                      className="p-1.5 px-3 bg-white/5 hover:bg-white/10 text-[10px] text-slate-300 rounded-lg flex items-center gap-1 cursor-pointer transition-all border border-white/5"
                    >
                      <RefreshCw size={11} className={withdrawalsLoading ? "animate-spin" : ""} />
                      <span>รีเฟรชข้อมูล</span>
                    </button>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-1.5 leading-relaxed">
                    แอดมินทำการตรวจสอบและอนุมัติยอดถอนเงินของผู้ขายที่ได้รับการสั่งซื้อและปิดดีลส่งถึงมือเรียบร้อยแล้ว กรุณาทำการโอนเงินจริงเข้าบัญชีผู้ขายตามข้อมูลด้านล่างก่อนกดยืนยันอนุมัติจ่ายเงินค่ะ
                  </p>
                </div>

                {withdrawalsLoading ? (
                  <div className="text-center py-12 text-slate-500 font-bold">กำลังดาวน์โหลดรายการถอนเงิน...</div>
                ) : adminWithdrawals.length === 0 ? (
                  <div className="p-10 text-center rounded-2xl border border-dashed border-white/10 bg-slate-900/30 text-slate-500">
                    ยังไม่มีคำขอถอนเงินที่รอดำเนินการในขณะนี้
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-950/40">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-950/80 border-b border-white/5 text-[10px] text-slate-400 uppercase font-black">
                          <th className="p-3">รหัสถอน</th>
                          <th className="p-3">ผู้ขอถอน</th>
                          <th className="p-3 text-right">จำนวนถอน</th>
                          <th className="p-3">ข้อมูลบัญชีธนาคารผู้รับเงิน</th>
                          <th className="p-3">วันที่ยื่นเรื่อง</th>
                          <th className="p-3 text-center">สถานะ</th>
                          <th className="p-3">บันทึกพิจารณา / การจัดการ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminWithdrawals.map((w: any) => (
                          <tr key={w.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                            <td className="p-3 font-mono text-[10px] text-slate-400">
                              {w.id}
                              {w.slipUrl && (
                                <div className="mt-1">
                                  <a 
                                    href={w.slipUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="inline-block px-1.5 py-0.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-[9px] text-emerald-400 rounded border border-emerald-500/15"
                                  >
                                    เปิดดูสลิป
                                  </a>
                                </div>
                              )}
                            </td>
                            <td className="p-3">
                              <span className="font-bold text-slate-200">{w.username}</span>
                              <div className="text-[9px] text-slate-500">ID: {w.userId}</div>
                            </td>
                            <td className="p-3 text-right text-emerald-400 font-bold text-sm">
                              ฿{w.amount.toLocaleString()}
                            </td>
                            <td className="p-3 space-y-0.5">
                              <span className="bg-emerald-500/10 text-emerald-400 text-[9px] px-1.5 py-0.5 rounded font-black mr-1 uppercase">{w.bankName}</span>
                              <span className="text-slate-200 font-semibold">{w.bankAccountNumber}</span>
                              <div className="text-[10px] text-slate-400 font-light">ชื่อบัญชี: {w.bankAccountName}</div>
                            </td>
                            <td className="p-3 text-slate-400 text-[10px]">
                              {new Date(w.submittedAt).toLocaleString('th-TH')}
                            </td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-wide ${
                                w.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                w.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                'bg-red-500/10 text-red-500 border border-red-500/20'
                              }`}>
                                {w.status === 'pending' ? '⏳ รอโอนอนุมัติ' :
                                 w.status === 'approved' ? '✓ จ่ายแล้ว' : '✗ ปฏิเสธ'}
                              </span>
                            </td>
                            <td className="p-3">
                              {w.status === "pending" ? (
                                <div className="space-y-2.5 min-w-[200px]">
                                  <input 
                                    type="text"
                                    id={`wnote-${w.id}`}
                                    placeholder="ระบุหมายเลขอ้างอิง หรือบันทึกข้อความ..."
                                    className="w-full bg-slate-900 border border-white/10 rounded-lg p-1.5 text-white text-[11px]"
                                  />

                                  {/* Upload Transfer Slip for the Seller */}
                                  <div className="space-y-1 bg-white/[0.02] p-2 rounded-lg border border-white/5">
                                    <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">แนบสลิปการโอนเงินสด:</label>
                                    <div className="flex items-center gap-2">
                                      <label className="cursor-pointer p-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/5 rounded-lg text-[10px] font-bold flex items-center gap-1">
                                        <Upload size={12} />
                                        {uploadingSlipId === w.id ? "กำลังอัปโหลด..." : withdrawalSlips[w.id] ? "เปลี่ยนรูปสลิป" : "อัปโหลดรูปภาพสลิป"}
                                        <input 
                                          type="file" 
                                          accept="image/*" 
                                          className="hidden" 
                                          disabled={uploadingSlipId === w.id}
                                          onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            if (!file.type.startsWith("image/")) {
                                              showCustomAlert("ผิดพลาด", "กรุณาเลือกไฟล์รูปภาพเท่านั้นค่ะ", "error");
                                              return;
                                            }
                                            setUploadingSlipId(w.id);
                                            const reader = new FileReader();
                                            reader.onloadend = async () => {
                                              const base64Data = reader.result as string;
                                              try {
                                                const res = await fetch("/api/upload", {
                                                  method: "POST",
                                                  headers: { "Content-Type": "application/json" },
                                                  body: JSON.stringify({ filename: file.name, base64Data })
                                                });
                                                if (res.ok) {
                                                  const data = await res.json();
                                                  setWithdrawalSlips(prev => ({ ...prev, [w.id]: data.url }));
                                                  showCustomAlert("สำเร็จ", "อัปโหลดไฟล์สลิปการโอนสำเร็จเรียบร้อยแล้วค่ะ", "success");
                                                } else {
                                                  showCustomAlert("ผิดพลาด", "อัปโหลดไฟล์ไม่สำเร็จ", "error");
                                                }
                                              } catch (err) {
                                                console.error(err);
                                                showCustomAlert("ผิดพลาด", "เกิดข้อผิดพลาดในการเชื่อมต่อเพื่ออัปโหลด", "error");
                                              } finally {
                                                setUploadingSlipId(null);
                                              }
                                            };
                                            reader.readAsDataURL(file);
                                          }}
                                        />
                                      </label>
                                      {withdrawalSlips[w.id] && (
                                        <span className="text-[10px] text-emerald-400 font-bold">✓ แนบสลิปแล้ว</span>
                                      )}
                                    </div>
                                    {withdrawalSlips[w.id] && (
                                      <div className="relative w-16 h-16 border border-white/10 rounded-lg overflow-hidden mt-1.5 bg-black">
                                        <img src={withdrawalSlips[w.id]} alt="slip preview" className="w-full h-full object-cover" />
                                        <button 
                                          type="button"
                                          onClick={() => setWithdrawalSlips(prev => {
                                            const copy = { ...prev };
                                            delete copy[w.id];
                                            return copy;
                                          })}
                                          className="absolute top-0.5 right-0.5 bg-red-600 hover:bg-red-500 text-white rounded-full p-0.5"
                                        >
                                          <X size={8} />
                                        </button>
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex gap-1.5">
                                    <button
                                      type="button"
                                      disabled={uploadingSlipId === w.id}
                                      onClick={() => {
                                        const noteVal = (document.getElementById(`wnote-${w.id}`) as HTMLInputElement)?.value || "";
                                        const slipUrl = withdrawalSlips[w.id];
                                        if (!slipUrl) {
                                          showCustomAlert("แจ้งเตือน", "กรุณาแนบไฟล์รูปสลิปการโอนเงินเพื่ออ้างอิงยืนยันให้ผู้ขายได้รับทราบก่อนค่ะ", "error");
                                          return;
                                        }
                                        handleReviewWithdrawal(w.id, "approved", noteVal, slipUrl);
                                      }}
                                      className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold rounded-lg text-[10px] text-center cursor-pointer"
                                    >
                                      อนุมัติจ่ายแล้ว
                                    </button>
                                    <button
                                      type="button"
                                      disabled={uploadingSlipId === w.id}
                                      onClick={() => {
                                        const noteVal = (document.getElementById(`wnote-${w.id}`) as HTMLInputElement)?.value || "";
                                        handleReviewWithdrawal(w.id, "rejected", noteVal);
                                      }}
                                      className="py-1.5 px-2 bg-red-600/80 hover:bg-red-500 disabled:opacity-40 text-white font-bold rounded-lg text-[10px] cursor-pointer"
                                    >
                                      ปฏิเสธ
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-[10px] space-y-1 text-slate-400 bg-white/[0.01] p-2 rounded-lg border border-white/[0.03]">
                                  <div>โดยแอดมิน: {new Date(w.reviewedAt).toLocaleDateString('th-TH')}</div>
                                  <div>หมายเหตุ: <span className="text-amber-400">{w.adminNotes || "ไม่มีหมายเหตุ"}</span></div>
                                  {w.slipUrl && (
                                    <div className="pt-1.5">
                                      <a 
                                        href={w.slipUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="inline-flex items-center gap-1.5 p-1 px-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-[9.5px] text-emerald-400 rounded-lg font-bold border border-emerald-500/20 transition-all"
                                      >
                                        <Eye size={11} />
                                        <span>เปิดดูภาพสลิปโอนเงิน</span>
                                      </a>
                                    </div>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

        {/* Custom Confirmation Modal */}
        {confirmDialog.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-2xl bg-[#1c1c21] border border-white/10 p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
              <h3 className="text-lg font-bold text-white mb-2">{confirmDialog.title}</h3>
              <p className="text-sm text-slate-300 mb-6">{confirmDialog.message}</p>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  {confirmDialog.cancelText || "ยกเลิก"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                    confirmDialog.onConfirm();
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white transition-all cursor-pointer shadow-lg shadow-red-600/20"
                >
                  {confirmDialog.confirmText || "ยืนยันการลบ"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Alert Modal */}
        {alertState.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-2xl bg-[#1c1c21] border border-white/10 p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                {alertState.type === "success" && <span className="text-emerald-500">✓</span>}
                {alertState.type === "error" && <span className="text-red-500">✗</span>}
                {alertState.type === "info" && <span className="text-amber-500">ℹ</span>}
                {alertState.title}
              </h3>
              <p className="text-sm text-slate-300 mb-6">{alertState.message}</p>
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
                  className={`px-5 py-2 rounded-xl text-xs font-bold text-white transition-all cursor-pointer shadow-md ${
                    alertState.type === "error" ? "bg-red-600 hover:bg-red-500 shadow-red-600/10" : "bg-amber-600 hover:bg-amber-500 shadow-amber-600/10"
                  }`}
                >
                  ตกลง
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
