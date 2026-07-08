import React, { useState, useEffect } from "react";
import { User, AppSettings, Category, Product } from "../types";
import LucideIcon from "./LucideIcon";
import { 
  X, Store, FileText, CheckCircle2, ShieldAlert, Award, RefreshCw, Eye,
  Coins, Plus, Edit, Trash, Truck, Image, HelpCircle, Gift, UserCheck, ChevronRight,
  Settings
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

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
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ filename: file.name, base64Data }),
          });

          if (!res.ok) throw new Error("อัปโหลดไม่สำเร็จ");

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
      {label && <label className="block text-[11px] text-stone-400 font-semibold">{label}</label>}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-stone-900 border border-white/10 rounded-xl p-2.5 text-white text-xs placeholder-stone-600 focus:outline-none focus:border-[#8E6D4E]/50 transition-colors"
          placeholder={placeholder || "ใส่ลิงก์รูปภาพ หรือกดปุ่มอัปโหลดรูป..."}
        />
        <label className="relative flex items-center justify-center gap-1.5 px-4 py-2.5 bg-stone-800 hover:bg-stone-700 border border-white/10 rounded-xl text-xs font-semibold text-stone-200 cursor-pointer transition-all select-none min-w-[110px] text-center">
          {uploading ? (
            <>
              <RefreshCw size={13} className="animate-spin text-amber-500" />
              <span>กำลังโหลด...</span>
            </>
          ) : (
            <>
              <Plus size={13} className="text-amber-500" />
              <span>อัปโหลดภาพ</span>
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
      {error && <p className="text-[10px] text-red-400 font-light">⚠️ {error}</p>}
    </div>
  );
}

interface SellerModalProps {
  user: User | null;
  settings: AppSettings;
  categories: Category[];
  onClose: () => void;
  onRefreshData: () => void;
}

export default function SellerModal({
  user,
  settings,
  categories,
  onClose,
  onRefreshData
}: SellerModalProps) {
  const [activeTab, setActiveTab] = useState<"balance" | "products" | "orders" | "settings">("balance");
  const [loading, setLoading] = useState(true);
  const [statusData, setStatusData] = useState<any>(null);

  // Shop Settings Form State
  const [settingsForm, setSettingsForm] = useState({
    shopName: "",
    shopDescription: "",
    bankName: "KBANK",
    bankAccountNumber: "",
    bankAccountName: ""
  });
  const [settingsSubmitting, setSettingsSubmitting] = useState(false);

  // Verification Form State
  const [applyForm, setApplyForm] = useState({
    shopName: "",
    shopDescription: "",
    fullName: "",
    citizenId: "",
    phone: "",
    bankName: "KBANK",
    bankAccountNumber: "",
    bankAccountName: "",
    sellerType: "internal" as "internal" | "external",
    idCardPhotoUrl: ""
  });
  const [applySubmitting, setApplySubmitting] = useState(false);

  // Seller Dashboard Lists State
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
  const [sellerOrders, setSellerOrders] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);

  // List loaders
  const [productsLoading, setProductsLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(false);

  // Form toggles
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    categoryId: categories[0]?.id || "",
    price: 0,
    imageUrl: "",
    description: "",
    details: "",
    stockText: "" // raw string, newline separated
  });
  const [productSubmitting, setProductSubmitting] = useState(false);

  // Withdraw request state
  const [withdrawAmount, setWithdrawAmount] = useState<number | "">("");
  const [withdrawSubmitting, setWithdrawSubmitting] = useState(false);

  // Ship dialog state
  const [shippingOrderId, setShippingOrderId] = useState<string | null>(null);
  const [shipForm, setShipForm] = useState({
    trackingCarrier: "",
    trackingNumber: ""
  });
  const [shipSubmitting, setShipSubmitting] = useState(false);

  // Alerts
  const [alert, setAlert] = useState<{ show: boolean; title: string; message: string; type: "success" | "error" } | null>(null);
  const [confirm, setConfirm] = useState<{ show: boolean; title: string; message: string; onConfirm: () => void } | null>(null);

  const showAlert = (title: string, message: string, type: "success" | "error") => {
    setAlert({ show: true, title, message, type });
  };

  const loadSellerStatus = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch("/api/seller/status", {
        headers: { "x-user-id": user.id }
      });
      if (res.ok) {
        const data = await res.json();
        setStatusData(data);
        if (data.isSeller) {
          fetchSellerProducts();
          fetchSellerOrders();
          fetchWithdrawals();
        }
        if (data.verification) {
          // pre-populate form with existing request info
          setApplyForm({
            shopName: data.verification.shopName || "",
            shopDescription: data.verification.shopDescription || "",
            fullName: data.verification.fullName || "",
            citizenId: data.verification.citizenId || "",
            phone: data.verification.phone || "",
            bankName: data.verification.bankName || "KBANK",
            bankAccountNumber: data.verification.bankAccountNumber || "",
            bankAccountName: data.verification.bankAccountName || "",
            sellerType: data.verification.sellerType || "internal",
            idCardPhotoUrl: data.verification.idCardPhotoUrl || ""
          });
          setSettingsForm({
            shopName: data.verification.shopName || "",
            shopDescription: data.verification.shopDescription || "",
            bankName: data.verification.bankName || "KBANK",
            bankAccountNumber: data.verification.bankAccountNumber || "",
            bankAccountName: data.verification.bankAccountName || ""
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSellerProducts = async () => {
    if (!user) return;
    setProductsLoading(true);
    try {
      const res = await fetch("/api/seller/products", {
        headers: { "x-user-id": user.id }
      });
      if (res.ok) {
        const data = await res.json();
        setSellerProducts(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchSellerOrders = async () => {
    if (!user) return;
    setOrdersLoading(true);
    try {
      const res = await fetch("/api/seller/orders", {
        headers: { "x-user-id": user.id }
      });
      if (res.ok) {
        const data = await res.json();
        setSellerOrders(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchWithdrawals = async () => {
    if (!user) return;
    setWithdrawalsLoading(true);
    try {
      const res = await fetch("/api/seller/withdrawals", {
        headers: { "x-user-id": user.id }
      });
      if (res.ok) {
        const data = await res.json();
        setWithdrawals(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setWithdrawalsLoading(false);
    }
  };

  useEffect(() => {
    loadSellerStatus();
  }, [user]);

  // Handle identity application submit
  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!applyForm.shopName || !applyForm.fullName || !applyForm.citizenId || !applyForm.phone || !applyForm.bankAccountNumber || !applyForm.bankAccountName || !applyForm.idCardPhotoUrl) {
      showAlert("ข้อมูลไม่ครบถ้วน", "กรุณากรอกข้อมูลและแนบภาพหลักฐานให้ครบทุกช่องก่อนส่งตรวจสอบค่ะ", "error");
      return;
    }

    setApplySubmitting(true);
    try {
      const res = await fetch("/api/seller/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id
        },
        body: JSON.stringify(applyForm)
      });
      if (res.ok) {
        showAlert("ส่งข้อมูลสำเร็จ", "ยื่นเอกสารสมัครเป็นผู้ขายเรียบร้อยแล้ว แอดมินจะทำการตรวจสอบโดยด่วนค่ะ", "success");
        loadSellerStatus();
      } else {
        const data = await res.json();
        showAlert("ผิดพลาด", data.error || "ไม่สามารถสมัครบทบาทผู้ขายได้", "error");
      }
    } catch (err) {
      showAlert("ผิดพลาด", "การเชื่อมต่อระบบขัดข้อง", "error");
    } finally {
      setApplySubmitting(false);
    }
  };

  // Withdraw money
  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !withdrawAmount || Number(withdrawAmount) <= 0) return;
    
    setWithdrawSubmitting(true);
    try {
      const res = await fetch("/api/seller/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id
        },
        body: JSON.stringify({ amount: Number(withdrawAmount) })
      });
      if (res.ok) {
        showAlert("ยื่นคำขอสำเร็จ", "ระบบส่งคำขอถอนเงินไปยังฝ่ายบัญชีแล้ว แอดมินจะทำการโอนตามคิวภายใน 24 ชม.", "success");
        setWithdrawAmount("");
        loadSellerStatus();
        onRefreshData();
      } else {
        const data = await res.json();
        showAlert("เกิดข้อผิดพลาด", data.error || "ไม่สามารถทำรายการถอนเงินได้", "error");
      }
    } catch (err) {
      showAlert("ผิดพลาด", "การเชื่อมต่อเซิร์ฟเวอร์ผิดพลาด", "error");
    } finally {
      setWithdrawSubmitting(false);
    }
  };

  // Manage listed product submit (Add or Edit)
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!productForm.name || !productForm.price || !productForm.imageUrl || !productForm.description) {
      showAlert("ข้อมูลไม่ครบ", "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วนค่ะ", "error");
      return;
    }

    setProductSubmitting(true);
    const stockArray = productForm.stockText
      ? productForm.stockText.split("\n").map(line => line.trim()).filter(line => line.length > 0)
      : [];

    try {
      const res = await fetch("/api/seller/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id
        },
        body: JSON.stringify({
          id: editingProduct?.id, // undefined for new ones
          name: productForm.name,
          categoryId: productForm.categoryId,
          price: Number(productForm.price),
          imageUrl: productForm.imageUrl,
          description: productForm.description,
          details: productForm.details,
          stock: stockArray
        })
      });

      if (res.ok) {
        showAlert("บันทึกสำเร็จ", "ลงข้อมูลสินค้าขายเรียบร้อยแล้วค่ะ", "success");
        setShowProductForm(false);
        setEditingProduct(null);
        setProductForm({
          name: "",
          categoryId: categories[0]?.id || "",
          price: 0,
          imageUrl: "",
          description: "",
          details: "",
          stockText: ""
        });
        fetchSellerProducts();
      } else {
        const data = await res.json();
        showAlert("ผิดพลาด", data.error || "ไม่สามารถจัดเก็บสินค้าได้", "error");
      }
    } catch (err) {
      showAlert("ผิดพลาด", "การเชื่อมต่อเซิร์ฟเวอร์ผิดพลาด", "error");
    } finally {
      setProductSubmitting(false);
    }
  };

  const handleDeleteProduct = (id: string) => {
    if (!user) return;
    setConfirm({
      show: true,
      title: "ยืนยันการลบสินค้า",
      message: "คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการลงขายสินค้าชิ้นนี้?",
      onConfirm: async () => {
        setConfirm(null);
        try {
          const res = await fetch(`/api/seller/products/${id}`, {
            method: "DELETE",
            headers: { "x-user-id": user.id }
          });
          if (res.ok) {
            showAlert("ลบสำเร็จ", "นำสินค้าออกจากระบบเรียบร้อย", "success");
            fetchSellerProducts();
          } else {
            const data = await res.json();
            showAlert("ผิดพลาด", data.error || "ลบไม่สำเร็จ", "error");
          }
        } catch (err) {
          showAlert("ล้มเหลว", "เครือข่ายผิดพลาด", "error");
        }
      }
    });
  };

  const handleEditProductClick = (p: Product) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      categoryId: p.categoryId,
      price: p.price,
      imageUrl: p.imageUrl,
      description: p.description,
      details: p.details || "",
      stockText: p.stock ? p.stock.join("\n") : ""
    });
    setShowProductForm(true);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSettingsSubmitting(true);
    try {
      const res = await fetch("/api/seller/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id
        },
        body: JSON.stringify(settingsForm)
      });
      const data = await res.json();
      if (res.ok) {
        showAlert("สำเร็จ", "บันทึกตั้งค่าร้านค้าเรียบร้อยแล้วค่ะ", "success");
        loadSellerStatus();
        onRefreshData();
      } else {
        showAlert("ผิดพลาด", data.error || "บันทึกไม่สำเร็จ", "error");
      }
    } catch (err) {
      showAlert("ผิดพลาด", "การเชื่อมต่อระบบล้มเหลว", "error");
    } finally {
      setSettingsSubmitting(false);
    }
  };

  // Ship order submitting tracking code
  const handleShipOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !shippingOrderId || !shipForm.trackingCarrier || !shipForm.trackingNumber) return;

    setShipSubmitting(true);
    try {
      const res = await fetch(`/api/seller/orders/${shippingOrderId}/ship`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id
        },
        body: JSON.stringify(shipForm)
      });
      if (res.ok) {
        showAlert("จัดส่งแล้ว", "ระบุข้อมูลและเปลี่ยนสถานะการส่งพัสดุเรียบร้อย ยอดเงินอยู่ในขั้นตอนการประกันสินค้า", "success");
        setShippingOrderId(null);
        setShipForm({ trackingCarrier: "", trackingNumber: "" });
        fetchSellerOrders();
      } else {
        const data = await res.json();
        showAlert("ผิดพลาด", data.error || "บันทึกจัดส่งไม่สำเร็จ", "error");
      }
    } catch (err) {
      showAlert("ล้มเหลว", "การเชื่อมต่อระบบล้มเหลว", "error");
    } finally {
      setShipSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 overflow-y-auto backdrop-blur-md">
      <div className="relative w-full max-w-5xl rounded-3xl bg-[#16161A] border border-white/10 p-4 sm:p-7 shadow-2xl z-10 flex flex-col max-h-[96vh] h-[92vh] md:h-[88vh]">
        
        {/* Head Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <Store size={20} className="text-teal-400" />
            <div>
              <h2 className="text-sm sm:text-base font-black text-white">
                {statusData?.isSeller ? `ศูนย์ผู้ขายร้านค้า: ${statusData.verification?.shopName}` : "สมัครเป็นพาร์ทเนอร์ผู้ขายระดับปลอดภัยสูง (KYC Seller)"}
              </h2>
              {statusData?.isSeller && (
                <span className="text-[10px] text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded font-bold uppercase mt-0.5 inline-block">
                  {statusData.verification?.sellerType === 'internal' ? "ร้านค้าภายในชุมชน (Internal Official)" : "ผู้ขายภายนอกระบบ (Community External)"}
                </span>
              )}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-stone-400 text-xs font-bold gap-2">
            <RefreshCw className="animate-spin text-teal-400" size={24} />
            <span>กำลังตรวจสอบสิทธิ์ผู้ขายระดับความปลอดภัยสูง...</span>
          </div>
        ) : !statusData?.isSeller ? (
          /* NOT A SELLER YET (SHOW APPLICATIONS / APPLY FORM) */
          <div className="flex-1 overflow-y-auto pr-1 pt-4 space-y-6 text-xs text-stone-300">
            {statusData?.verification?.status === "pending" ? (
              /* PENDING KYC */
              <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/20 max-w-xl mx-auto text-center space-y-4">
                <ShieldAlert size={48} className="mx-auto text-amber-500 animate-pulse" />
                <h3 className="text-base font-extrabold text-amber-500">เอกสารของคุณอยู่ในขั้นตอนพิจารณาอนุมัติ</h3>
                <p className="text-[11px] leading-relaxed text-stone-300">
                  คุณได้ยื่นเอกสารสมัครเป็นผู้ขายในชื่อร้าน <strong className="text-white">"{statusData.verification.shopName}"</strong> เรียบร้อยแล้วค่ะ เจ้าหน้าที่ฝ่ายตรวจสอบและแอดมินกำลังตรวจสอบความปลอดภัยของเอกสาร รวมถึงบัญชีธนาคารเพื่อความปลอดภัยระดับสูงของระบบ
                </p>
                <div className="p-3.5 rounded-xl bg-stone-950/40 border border-white/5 text-left text-[11.5px] text-stone-400 space-y-1">
                  <p>• <strong>ร้านค้า:</strong> {statusData.verification.shopName}</p>
                  <p>• <strong>ชื่อเต็มผู้สมัคร:</strong> {statusData.verification.fullName}</p>
                  <p>• <strong>ธนาคารโอนเงิน:</strong> {statusData.verification.bankName} (เลข: {statusData.verification.bankAccountNumber})</p>
                  <p>• <strong>วันที่ยื่นสมัคร:</strong> {new Date(statusData.verification.submittedAt).toLocaleString('th-TH')}</p>
                </div>
                <div className="pt-2 text-[10px] text-stone-500 font-light">
                  * โดยทั่วไปแอดมินจะพิจารณาอนุมัติผ่านเกณฑ์ภายในเวลา 10-60 นาที ขอบคุณสำหรับความไว้วางใจค่ะ
                </div>
              </div>
            ) : (
              /* APPLY NEW OR SHOW REJECTED + RETRY */
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                
                {/* Instruction left block */}
                <div className="md:col-span-4 space-y-4 bg-stone-900/30 border border-white/5 p-4 rounded-2xl">
                  <div className="flex items-center gap-2 text-white font-extrabold">
                    <Award className="text-teal-400" size={16} />
                    <span>เงื่อนไขและสิทธิ์ผู้ขาย</span>
                  </div>
                  <ul className="space-y-3 text-[11px] text-stone-400 leading-relaxed list-disc pl-4">
                    <li>ผู้สมัครต้องแนบรูปบัตรประชาชนหรือใบขับขี่ที่ตรงกับข้อมูลและหน้าสมุดบัญชีธนาคารเพื่อรับยอดโอนถอนเงิน</li>
                    <li>เมื่อได้รับคำสั่งซื้อ ยอดเงินจะถูกถือครองในกระเป๋า Escrow (Pending Balance) จนกว่าผู้รับจะได้รับสินค้าและกดยอมรับ</li>
                    <li>หากเกิดกรณีฉ้อโกงหรือของส่งไม่ถึงมือ แอดมินสามารถระงับวงเงินประกันและคืนเงินแก่ลูกค้าได้ทันทีเพื่อความปลอดภัยสูง</li>
                    <li>แอดมินใช้เวลาอนุมัติ KYC รวดเร็ว เพื่อป้องกันพ่อค้าแม่ค้าปลอมสร้างความเสียหายต่อชุมชน</li>
                  </ul>

                  {statusData?.verification?.status === "rejected" && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] space-y-1">
                      <p className="font-extrabold">⚠️ ใบสมัครล่าสุดถูกปฏิเสธ:</p>
                      <p className="text-white italic bg-red-500/5 p-1.5 rounded border border-red-500/10 font-medium">"{statusData.verification.adminNotes || "เอกสารไม่ชัดเจน/ไม่ถูกต้อง"}"</p>
                      <p className="text-[10px] pt-1 text-red-500">กรุณาแก้ไขเอกสารให้ถูกต้องและกดส่งใหม่อีกครั้งค่ะ</p>
                    </div>
                  )}
                </div>

                {/* Form apply right block */}
                <form onSubmit={handleApplySubmit} className="md:col-span-8 space-y-4">
                  <h3 className="text-white text-xs font-bold uppercase tracking-wider border-b border-white/5 pb-1">กรอกข้อมูลยืนยันตนสำหรับการลงทะเบียนค้าขาย</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] text-stone-400 font-bold">เลือกประเภทกลุ่มร้านขาย (Seller Group):</label>
                      <select 
                        value={applyForm.sellerType}
                        onChange={(e) => setApplyForm(prev => ({ ...prev, sellerType: e.target.value as any }))}
                        className="w-full bg-stone-900 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#8E6D4E]/40"
                      >
                        <option value="internal">ผู้ขายภายในชุมชน (Internal Official)</option>
                        <option value="external">ผู้ขายทั่วไป/ภายนอกระบบ (External Community)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] text-stone-400 font-bold">ชื่อร้านค้า (Shop Name):</label>
                      <input 
                        type="text"
                        value={applyForm.shopName}
                        onChange={(e) => setApplyForm(prev => ({ ...prev, shopName: e.target.value }))}
                        placeholder="ตั้งชื่อแบรนด์หรือร้านค้าของคุณ..."
                        className="w-full bg-stone-900 border border-white/10 rounded-xl p-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-[#8E6D4E]/40"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] text-stone-400 font-bold">สโลแกน / คำอธิบายร้านโดยย่อ:</label>
                    <input 
                      type="text"
                      value={applyForm.shopDescription}
                      onChange={(e) => setApplyForm(prev => ({ ...prev, shopDescription: e.target.value }))}
                      placeholder="เช่น 'แหล่งรวมผลงานผ้าไหมพรีเมียมจากพิจิตร' หรือ 'จำหน่ายรหัสโค้ดคุณภาพราคาเป็นกันเอง'"
                      className="w-full bg-stone-900 border border-white/10 rounded-xl p-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-[#8E6D4E]/40"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] text-stone-400 font-bold">ชื่อ-นามสกุลจริง (ตามบัตรประชาชน):</label>
                      <input 
                        type="text"
                        value={applyForm.fullName}
                        onChange={(e) => setApplyForm(prev => ({ ...prev, fullName: e.target.value }))}
                        placeholder="ชื่อและนามสกุลจริงของคุณ..."
                        className="w-full bg-stone-900 border border-white/10 rounded-xl p-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-[#8E6D4E]/40"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] text-stone-400 font-bold">เลขประจำตัวบัตรประชาชน (Citizen ID):</label>
                      <input 
                        type="text"
                        value={applyForm.citizenId}
                        onChange={(e) => setApplyForm(prev => ({ ...prev, citizenId: e.target.value }))}
                        placeholder="กรอกเลขบัตร 13 หลัก..."
                        className="w-full bg-stone-900 border border-white/10 rounded-xl p-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-[#8E6D4E]/40"
                        maxLength={13}
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] text-stone-400 font-bold">เบอร์โทรศัพท์มือถือติดต่อ:</label>
                      <input 
                        type="tel"
                        value={applyForm.phone}
                        onChange={(e) => setApplyForm(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="เช่น 0812345678..."
                        className="w-full bg-stone-900 border border-white/10 rounded-xl p-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-[#8E6D4E]/40"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-[#1e1e24] border border-white/5">
                    <div className="space-y-1">
                      <label className="block text-[10px] text-stone-400 font-bold">ธนาคารสำหรับถอนยอดเงินขาย:</label>
                      <select 
                        value={applyForm.bankName}
                        onChange={(e) => setApplyForm(prev => ({ ...prev, bankName: e.target.value }))}
                        className="w-full bg-stone-950 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#8E6D4E]/40"
                      >
                        <option value="KBANK">ธนาคารกสิกรไทย (KBANK)</option>
                        <option value="SCB">ธนาคารไทยพาณิชย์ (SCB)</option>
                        <option value="BBL">ธนาคารกรุงเทพ (BBL)</option>
                        <option value="KTB">ธนาคารกรุงไทย (KTB)</option>
                        <option value="BAY">ธนาคารกรุงศรีอยุธยา (BAY)</option>
                        <option value="TTB">ธนาคารทหารไทยธนชาต (TTB)</option>
                        <option value="GSB">ธนาคารออมสิน (GSB)</option>
                        <option value="TRUEWALLET">ทรูมันนี่วอลเล็ท (TrueWallet)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] text-stone-400 font-bold">เลขที่บัญชีธนาคาร:</label>
                      <input 
                        type="text"
                        value={applyForm.bankAccountNumber}
                        onChange={(e) => setApplyForm(prev => ({ ...prev, bankAccountNumber: e.target.value }))}
                        placeholder="เลขบัญชีรับเงินโอน..."
                        className="w-full bg-stone-950 border border-white/10 rounded-xl p-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-[#8E6D4E]/40"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] text-stone-400 font-bold">ชื่อบัญชีธนาคาร (ตรงกับบัตร):</label>
                      <input 
                        type="text"
                        value={applyForm.bankAccountName}
                        onChange={(e) => setApplyForm(prev => ({ ...prev, bankAccountName: e.target.value }))}
                        placeholder="ชื่อบัญชีรับเงิน..."
                        className="w-full bg-stone-950 border border-white/10 rounded-xl p-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-[#8E6D4E]/40"
                        required
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-stone-950/50 rounded-2xl border border-white/5">
                    <ImageUploader 
                      label="อัปโหลดหลักฐานยืนยันตนเพื่อความปลอดภัยสูงสุด (เช่น รูปเซลฟี่คู่กับบัตรประชาชน หรือเอกสารยืนยันตัวตน):"
                      value={applyForm.idCardPhotoUrl}
                      onChange={(url) => setApplyForm(prev => ({ ...prev, idCardPhotoUrl: url }))}
                      placeholder="ใส่ลิงก์รูปถ่ายหลักฐานยืนยัน หรืออัปโหลดไฟล์..."
                    />
                    {applyForm.idCardPhotoUrl && (
                      <div className="mt-3">
                        <span className="text-[10px] text-stone-500">ตัวอย่างหลักฐานที่อัปโหลด:</span>
                        <img 
                          src={applyForm.idCardPhotoUrl} 
                          alt="ID Card proof" 
                          className="max-h-24 rounded border border-white/10 mt-1 object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={applySubmitting}
                      className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-emerald-400 text-slate-950 font-extrabold py-3 px-8 rounded-xl hover:scale-102 hover:opacity-95 active:scale-98 transition-all cursor-pointer shadow-lg shadow-teal-500/20"
                    >
                      {applySubmitting ? "กำลังส่งข้อมูลตรวจ..." : "ยื่นเอกสารอนุมัติผ่านเกณฑ์ความปลอดภัย"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        ) : (
          /* IS A VERIFIED SELLER (SHOW DASHBOARD WORKSPACE) */
          <div className="flex-1 flex flex-col md:grid md:grid-cols-12 gap-5 pt-4 min-h-0 overflow-hidden">
            
            {/* SUB-TABS SELECTOR */}
            <div className="flex-shrink-0 md:col-span-3 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible pb-2.5 md:pb-0 border-b md:border-b-0 md:border-r border-white/5 pr-0 md:pr-4 h-fit md:h-full scrollbar-thin">
              <button
                onClick={() => setActiveTab("balance")}
                className={`flex-shrink-0 md:w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold rounded-xl transition-all text-left whitespace-nowrap cursor-pointer ${
                  activeTab === "balance" ? "bg-teal-500/10 text-teal-400 border-r-2 border-teal-500" : "text-stone-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Coins size={14} />
                <span>การเงิน & การถอน</span>
              </button>

              <button
                onClick={() => setActiveTab("products")}
                className={`flex-shrink-0 md:w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold rounded-xl transition-all text-left whitespace-nowrap cursor-pointer ${
                  activeTab === "products" ? "bg-teal-500/10 text-teal-400 border-r-2 border-teal-500" : "text-stone-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Plus size={14} />
                <span>จัดการสินค้าของฉัน</span>
              </button>

              <button
                onClick={() => setActiveTab("orders")}
                className={`flex-shrink-0 md:w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold rounded-xl transition-all text-left whitespace-nowrap cursor-pointer ${
                  activeTab === "orders" ? "bg-teal-500/10 text-teal-400 border-r-2 border-teal-500" : "text-stone-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Truck size={14} />
                <span className="flex-1">ออเดอร์ของฉัน</span>
                {sellerOrders.filter(o => o.orderStatus === 'preparing').length > 0 && (
                  <span className="bg-red-500 text-white font-black px-1.5 py-0.5 rounded-full text-[9px] flex-shrink-0">
                    {sellerOrders.filter(o => o.orderStatus === 'preparing').length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("settings")}
                className={`flex-shrink-0 md:w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold rounded-xl transition-all text-left whitespace-nowrap cursor-pointer ${
                  activeTab === "settings" ? "bg-teal-500/10 text-teal-400 border-r-2 border-teal-500" : "text-stone-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Settings size={14} />
                <span>ตั้งค่าโปรไฟล์ร้าน</span>
              </button>
            </div>

            {/* MAIN WORKSPACE CONTENT */}
            <div className="flex-1 min-h-0 md:col-span-9 h-full overflow-y-auto pr-1">
              
              {/* TAB 1: Balance and Withdrawals */}
              {activeTab === "balance" && (
                <div className="space-y-4 text-xs">
                  
                  {/* Balance Cards Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-stone-900/50 border border-white/5 relative overflow-hidden">
                      <div className="absolute right-4 top-4 opacity-5 text-teal-400"><Coins size={70} /></div>
                      <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">ยอดเงินประกัน/รอยืนยัน (Pending Escrow)</span>
                      <p className="text-3xl font-black text-amber-500 tracking-tight mt-1.5">฿{(statusData.pendingBalance || 0).toLocaleString()}</p>
                      <p className="text-[10px] text-stone-500 mt-2 font-light">
                        * ถือครองเงินค้ำประกันเพื่อคุ้มครองลูกค้า เงินจะถูกปล่อยเมื่อส่งของถึงมือลูกค้าและลูกค้ากดยืนยันรับสินค้า
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-teal-950/10 border border-teal-500/20 relative overflow-hidden">
                      <div className="absolute right-4 top-4 opacity-5 text-teal-400"><Store size={70} /></div>
                      <span className="text-[10px] uppercase font-bold text-teal-400 block tracking-wider">ยอดเงินที่ถอนได้ (Withdrawable Net Balance)</span>
                      <p className="text-3xl font-black text-teal-400 tracking-tight mt-1.5">฿{(statusData.withdrawableBalance || 0).toLocaleString()}</p>
                      <p className="text-[10px] text-stone-400 mt-2 font-light">
                        * ปลดล็อคโอนเรียบร้อยพร้อมถอนเงินเข้าบัญชีธนาคารที่คุณลงทะเบียนไว้กับระบบโดยอัตโนมัติ
                      </p>
                    </div>
                  </div>

                  {/* Escrow note info */}
                  <div className="p-3 bg-[#1e1e24] rounded-xl border border-white/5 text-stone-400 leading-relaxed text-[11px]">
                    ⚠️ <strong>ระบบป้องกันภัยซื้อขายสินค้าแบบ Escrow</strong>: เมื่อมีลูกค้ามาซื้อสินค้าของคุณ เงินค่าสินค้านั้นจะจ่ายเข้ามาสู่ <em>Pending Balance</em> ทันทีเพื่อความปลอดภัยสูง หลังจากคุณจัดส่งสินค้าเรียบร้อยและลูกค้ากด <strong>"ยืนยันว่าได้รับสินค้าแล้ว"</strong> เงินจะเปลี่ยนเป็น <em>Withdrawable Balance</em> พร้อมให้คุณสั่งถอนเงินสดเข้าบัญชีได้ทันทีค่ะ!
                  </div>

                  {/* Form Cashout and withdrawal History */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                    
                    {/* Withdraw Form */}
                    <form onSubmit={handleWithdrawSubmit} className="md:col-span-5 p-4 rounded-2xl bg-stone-900/40 border border-white/10 space-y-3.5">
                      <h4 className="text-white text-xs font-black uppercase tracking-wider">ทำเรื่องถอนเงินเข้าธนาคาร</h4>
                      <p className="text-[10.5px] text-stone-400 leading-normal">
                        ยอดเงินจะถูกโอนไปยังบัญชีธนาคารของคุณ <strong className="text-teal-400">({statusData.verification?.bankName} - {statusData.verification?.bankAccountNumber})</strong> ที่ผ่านการอนุมัติ
                      </p>

                      <div className="space-y-1">
                        <label className="block text-[10px] text-stone-400">ระบุจำนวนเงินที่ต้องการถอน (THB):</label>
                        <div className="relative">
                          <input 
                            type="number"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value === "" ? "" : Number(e.target.value))}
                            placeholder="ยอดเงินไม่เกินยอดที่ถอนได้..."
                            max={statusData.withdrawableBalance || 0}
                            min={100}
                            className="w-full bg-stone-950 border border-white/10 rounded-xl p-2.5 pl-6 text-white text-xs placeholder-stone-600 focus:outline-none focus:border-teal-500/50"
                            required
                          />
                          <span className="absolute left-2.5 top-2.5 text-stone-500 font-extrabold">฿</span>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={withdrawSubmitting || !withdrawAmount || Number(withdrawAmount) > (statusData.withdrawableBalance || 0)}
                        className="w-full bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-md shadow-teal-600/10 cursor-pointer text-center disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {withdrawSubmitting ? "กำลังส่งคำขอถอน..." : "ยืนยันการขอถอนเงินสด"}
                      </button>
                    </form>

                    {/* Withdraw History Table */}
                    <div className="md:col-span-7 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-white text-xs font-black uppercase tracking-wider">ประวัติการสั่งถอนเงินของคุณ</h4>
                        <button 
                          onClick={fetchWithdrawals}
                          className="text-[10px] text-stone-500 hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw size={10} className={withdrawalsLoading ? "animate-spin text-teal-400" : ""} />
                          <span>รีเฟรชประวัติ</span>
                        </button>
                      </div>

                      {withdrawalsLoading ? (
                        <div className="text-center py-8 text-stone-500 font-bold">กำลังโหลด...</div>
                      ) : withdrawals.length === 0 ? (
                        <div className="p-8 text-center rounded-xl bg-stone-900/20 border border-dashed border-white/5 text-stone-500">
                          ยังไม่มีประวัติการส่งเรื่องถอนเงินในอดีตค่ะ
                        </div>
                      ) : (
                        <div className="overflow-x-auto rounded-xl border border-white/5 bg-stone-950/40 max-h-[220px] overflow-y-auto">
                          <table className="w-full text-left border-collapse text-[10.5px]">
                            <thead>
                              <tr className="bg-stone-950 border-b border-white/5 text-[9px] uppercase font-black text-stone-400">
                                <th className="p-2">จำนวนเงิน</th>
                                <th className="p-2">วันที่ยื่นเรื่อง</th>
                                <th className="p-2">สถานะ</th>
                                <th className="p-2">หมายเหตุแอดมิน</th>
                                <th className="p-2 text-center">สลิปการโอน</th>
                              </tr>
                            </thead>
                            <tbody>
                              {withdrawals.map((w: any) => (
                                <tr key={w.id} className="border-b border-white/[0.03] hover:bg-white/[0.01] transition-colors">
                                  <td className="p-2 font-bold text-white">฿{w.amount.toLocaleString()}</td>
                                  <td className="p-2 text-stone-400">{new Date(w.submittedAt).toLocaleDateString('th-TH')}</td>
                                  <td className="p-2">
                                    <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-bold ${
                                      w.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                                      w.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                                      'bg-red-500/10 text-red-500'
                                    }`}>
                                      {w.status === 'pending' ? 'รอโอน' :
                                       w.status === 'approved' ? 'จ่ายแล้ว' : 'ปฏิเสธ'}
                                    </span>
                                  </td>
                                  <td className="p-2 text-stone-500 font-light max-w-[120px] truncate" title={w.adminNotes}>
                                    {w.adminNotes || "-"}
                                  </td>
                                  <td className="p-2 text-center">
                                    {w.slipUrl ? (
                                      <a 
                                        href={w.slipUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-[9.5px] font-bold text-teal-400 hover:text-teal-300 hover:underline bg-teal-500/10 hover:bg-teal-500/20 px-1.5 py-0.5 rounded transition-all cursor-pointer"
                                      >
                                        <Eye size={10} />
                                        <span>ดูสลิป</span>
                                      </a>
                                    ) : (
                                      <span className="text-stone-600">-</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 2: My Listed Products */}
              {activeTab === "products" && (
                <div className="space-y-4 text-xs">
                  
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <div>
                      <h4 className="text-white text-xs font-black uppercase tracking-wider">คลังสินค้าจำหน่ายส่วนตัว (My Shop Inventory)</h4>
                      <p className="text-[10.5px] text-stone-400 mt-0.5">คุณสามารถวางจำหน่าย แก้ไข และระบุสต็อกคีย์ผลิตภัณฑ์ในร้านของคุณได้ที่นี่ค่ะ</p>
                    </div>
                    {!showProductForm && (
                      <button 
                        onClick={() => {
                          setEditingProduct(null);
                          setProductForm({
                            name: "",
                            categoryId: categories[0]?.id || "",
                            price: 0,
                            imageUrl: "",
                            description: "",
                            details: "",
                            stockText: ""
                          });
                          setShowProductForm(true);
                        }}
                        className="p-2 px-4 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-lg shadow-teal-600/10"
                      >
                        <Plus size={13} />
                        <span>เพิ่มสินค้าขาย</span>
                      </button>
                    )}
                  </div>

                  {showProductForm ? (
                    /* PRODUCT UPLOADING/CREATING FORM */
                    <form onSubmit={handleProductSubmit} className="p-5 rounded-2xl bg-stone-900/40 border border-white/10 space-y-4">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="text-xs font-bold text-teal-400">{editingProduct ? "✏️ แก้ไขรายละเอียดสินค้า" : "✨ ลงประกาศขายสินค้าชิ้นใหม่"}</span>
                        <button 
                          type="button" 
                          onClick={() => { setShowProductForm(false); setEditingProduct(null); }}
                          className="text-stone-400 hover:text-white"
                        >
                          ยกเลิก
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-[10px] text-stone-400 font-bold">ชื่อสินค้า (Product Name):</label>
                          <input 
                            type="text"
                            value={productForm.name}
                            onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="ระบุชื่อสินค้า เช่น ผ้าทอลายพิจิตรรุ่นพิเศษ..."
                            className="w-full bg-stone-950 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-teal-500/40"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] text-stone-400 font-bold">หมวดหมู่สินค้า:</label>
                          <select 
                            value={productForm.categoryId}
                            onChange={(e) => setProductForm(prev => ({ ...prev, categoryId: e.target.value }))}
                            className="w-full bg-stone-950 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-teal-500/40"
                          >
                            {categories.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-[10px] text-stone-400 font-bold">ราคาวางจำหน่าย (บาท - THB):</label>
                          <input 
                            type="number"
                            value={productForm.price || ""}
                            onChange={(e) => setProductForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                            placeholder="ราคาจำหน่าย..."
                            className="w-full bg-stone-950 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-teal-500/40"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <ImageUploader 
                            label="รูปภาพสินค้าขาย (หรืออัปโหลด):"
                            value={productForm.imageUrl}
                            onChange={(url) => setProductForm(prev => ({ ...prev, imageUrl: url }))}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] text-stone-400 font-bold">คำอธิบายภาพรวมสั้นๆ (Short Description):</label>
                        <input 
                          type="text"
                          value={productForm.description}
                          onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="สรุปจุดเด่นของผลิตภัณฑ์ไม่เกิน 1 ประโยค..."
                          className="w-full bg-stone-950 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-teal-500/40"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-[10px] text-stone-400 font-bold">รายละเอียดสินค้าเพิ่มเติม / สเปกแบบยาว (Markdown):</label>
                          <textarea 
                            value={productForm.details}
                            onChange={(e) => setProductForm(prev => ({ ...prev, details: e.target.value }))}
                            placeholder="ระบุสเปก, ขนาดสินค้า, หรือข้อมูลจำเพาะแบบละเอียดเพื่อแจ้งให้ลูกค้าทราบ..."
                            className="w-full bg-stone-950 border border-white/10 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-teal-500/40"
                            rows={6}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] text-stone-400 font-bold">
                            สต็อกผลิตภัณฑ์ / รหัสคีย์จัดส่งอัตโนมัติ (ใส่หนึ่งบรรทัดต่อชิ้น):
                          </label>
                          <textarea 
                            value={productForm.stockText}
                            onChange={(e) => setProductForm(prev => ({ ...prev, stockText: e.target.value }))}
                            placeholder="สำหรับสินค้าส่งแบบอัตโนมัติ (เช่น รหัสบัตร, ลิงก์ดาวน์โหลด, หรือคีย์พิเศษ) ใส่ 1 รายการต่อบรรทัด ยอดซื้อจะหั่นสินค้าในนี้ไปจัดส่งทีละบรรทัดโดยอัตโนมัติค่ะ หากต้องการคุมคลังพัสดุแมนนวลให้ใส่ข้อมูลจัดส่งเฉยๆ ก็ได้ค่ะ"
                            className="w-full bg-stone-950 border border-white/10 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-teal-500/40 text-[10.5px] leading-tight"
                            rows={6}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button 
                          type="button" 
                          onClick={() => { setShowProductForm(false); setEditingProduct(null); }}
                          className="px-5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold rounded-xl"
                        >
                          ยกเลิก
                        </button>
                        <button 
                          type="submit"
                          disabled={productSubmitting}
                          className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-400 text-slate-950 font-black rounded-xl cursor-pointer"
                        >
                          {productSubmitting ? "กำลังจัดเก็บ..." : "บันทึกข้อมูลการวางจำหน่าย"}
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* PRODUCT LIST TABLE */
                    <div>
                      {productsLoading ? (
                        <div className="text-center py-12 text-stone-500 font-bold">กำลังดาวน์โหลดสต็อกสินค้า...</div>
                      ) : sellerProducts.length === 0 ? (
                        <div className="p-12 text-center rounded-2xl border border-dashed border-white/10 bg-stone-900/10 text-stone-500">
                          คุณยังไม่ได้เพิ่มสินค้าของคุณเข้าสู่วางจำหน่ายเลยค่ะ ลองกดปุ่ม "เพิ่มสินค้าขาย" ขวาบนดูสิคะ!
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {sellerProducts.map(p => (
                            <div key={p.id} className="p-4 rounded-2xl bg-stone-900/40 border border-white/10 flex gap-3 relative hover:border-white/20 transition-all">
                              <img 
                                src={p.imageUrl} 
                                alt={p.name} 
                                className="w-16 h-16 rounded-xl object-cover border border-white/5 bg-black"
                                referrerPolicy="no-referrer"
                              />
                              <div className="flex-1 min-w-0 space-y-1">
                                <h5 className="font-bold text-white truncate text-xs sm:text-sm" title={p.name}>{p.name}</h5>
                                <p className="text-[10px] text-[#8E6D4E] font-bold">฿{p.price.toLocaleString()}</p>
                                <p className="text-[10px] text-stone-400 truncate">{p.description}</p>
                                <div className="flex items-center gap-2 pt-1">
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-stone-300">
                                    จำนวนสต็อก: <strong className="text-teal-400">{(p.stock || []).length}</strong> ชิ้น
                                  </span>
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-stone-300">
                                    ขายได้แล้ว: <strong className="text-amber-500">{p.timesSold || 0}</strong> ครั้ง
                                  </span>
                                </div>
                              </div>

                              <div className="absolute right-2 top-2 flex gap-1">
                                <button 
                                  onClick={() => handleEditProductClick(p)}
                                  className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
                                  title="แก้ไขสเปก"
                                >
                                  <Edit size={12} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteProduct(p.id)}
                                  className="p-1 rounded bg-red-950/40 hover:bg-red-500 text-red-400 hover:text-white cursor-pointer"
                                  title="ลบออก"
                                >
                                  <Trash size={12} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: My Orders */}
              {activeTab === "orders" && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between pb-1 border-b border-white/5">
                    <div>
                      <h4 className="text-white text-xs font-black uppercase tracking-wider">แผงพัสดุและจัดส่งของลูกค้า (My Orders & Shipment Fulfillment Desk)</h4>
                      <p className="text-[10.5px] text-stone-400 mt-0.5">ตรวจสอบคำสั่งซื้อที่เข้ามายังสินค้าของร้านคุณ และกรอกเลขติดตามจัดส่งเมื่อพร้อมส่งพัสดุค่ะ</p>
                    </div>
                    <button 
                      onClick={fetchSellerOrders}
                      className="text-[10.5px] text-stone-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw size={11} className={ordersLoading ? "animate-spin text-teal-400" : ""} />
                      <span>รีเฟรชออเดอร์</span>
                    </button>
                  </div>

                  {ordersLoading ? (
                    <div className="text-center py-12 text-stone-500 font-bold">กำลังดาวน์โหลดคำสั่งซื้อของลูกค้า...</div>
                  ) : sellerOrders.length === 0 ? (
                    <div className="p-12 text-center rounded-2xl border border-dashed border-white/10 bg-stone-900/10 text-stone-500">
                      ยังไม่มีลูกค้ามาส่งคำสั่งซื้อสินค้าของคุณในขณะนี้ค่ะ
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-white/10 bg-stone-950/40">
                      <table className="w-full text-left border-collapse text-[10.5px]">
                        <thead>
                          <tr className="bg-stone-950 border-b border-white/5 text-[9px] uppercase font-black text-stone-400">
                            <th className="p-3">วันที่ / เลขที่ใบเสร็จ</th>
                            <th className="p-3">ผู้ซื้อ</th>
                            <th className="p-3">สินค้าที่ซื้อ</th>
                            <th className="p-3 text-right">ยอดรับสุทธิ</th>
                            <th className="p-3">ข้อมูลจัดส่งที่อยู่ลูกค้า</th>
                            <th className="p-3 text-center">สถานะ</th>
                            <th className="p-3 text-center">ดำเนินการจัดส่ง</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sellerOrders.map((o: any) => (
                            <tr key={o.id} className="border-b border-white/[0.03] hover:bg-white/[0.01]">
                              <td className="p-3">
                                <span className="text-stone-300 block">{new Date(o.date).toLocaleDateString('th-TH')}</span>
                                <span className="font-mono text-[9px] text-stone-500 block">{o.id}</span>
                              </td>
                              <td className="p-3 font-bold text-white">{o.username}</td>
                              <td className="p-3">
                                <span className="font-bold text-white block">{o.details?.split(" ")[1] || "สินค้าไอเทม"}</span>
                                <span className="text-[9px] text-stone-500 block">ID สินค้า: {o.productId}</span>
                              </td>
                              <td className="p-3 text-right text-emerald-400 font-bold">฿{o.amount.toLocaleString()}</td>
                              <td className="p-3 space-y-0.5 max-w-[200px]">
                                {o.shippingDetails ? (
                                  <>
                                    <div className="font-bold text-white text-[11px]">{o.shippingDetails.name} ({o.shippingDetails.phone})</div>
                                    <div className="text-stone-400 text-[10px] leading-tight font-light truncate" title={o.shippingDetails.address}>
                                      {o.shippingDetails.address} {o.shippingDetails.zip}
                                    </div>
                                    <span className="inline-block text-[9px] px-1.5 py-0.2 rounded bg-teal-500/10 text-teal-400 font-bold">ส่งโดย: {o.shippingDetails.method}</span>
                                  </>
                                ) : (
                                  <span className="text-stone-500 italic">จัดส่งผ่านโค้ดอัตโนมัติ/ไม่มีที่อยู่</span>
                                )}
                              </td>
                              <td className="p-3 text-center">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                  o.orderStatus === 'preparing' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                  o.orderStatus === 'shipped' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' :
                                  o.orderStatus === 'delivered' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                  'bg-red-500/10 text-red-500 border border-red-500/20'
                                }`}>
                                  {o.orderStatus === 'preparing' ? 'เตรียมจัดส่ง' :
                                   o.orderStatus === 'shipped' ? 'จัดส่งแล้ว' :
                                   o.orderStatus === 'delivered' ? 'ถึงมือลูกค้าแล้ว' : o.orderStatus}
                                </span>
                              </td>
                              <td className="p-3 text-center">
                                {o.orderStatus === 'preparing' ? (
                                  <button
                                    onClick={() => setShippingOrderId(o.id)}
                                    className="px-2.5 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:opacity-90 active:scale-95 text-slate-950 text-[10px] font-black rounded-lg transition-all cursor-pointer shadow-md shadow-amber-500/10"
                                  >
                                    ใส่รหัสแทรคกิ้งเพื่อส่งพัสดุ
                                  </button>
                                ) : o.orderStatus === 'shipped' ? (
                                  <div className="text-[10px] text-stone-400">
                                    <span>แทรคกิ้ง: <strong>{o.trackingNumber}</strong></span>
                                    <span className="block text-[9.5px] text-stone-500 font-light">รอผู้ซื้อกดยอมรับดีล</span>
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-stone-500 italic">เสร็จสิ้นสมบูรณ์ ✓</span>
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

              {/* TAB 4: Seller Shop Settings */}
              {activeTab === "settings" && (
                <div className="space-y-4 text-xs animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-1 border-b border-white/5">
                    <div>
                      <h4 className="text-white text-xs font-black uppercase tracking-wider">ตั้งค่าและข้อมูลโปรไฟล์ร้านค้า (Shop Configuration Profile)</h4>
                      <p className="text-[10.5px] text-stone-400 mt-0.5">คุณสามารถกำหนดรายละเอียดชื่อร้านค้า สโลแกน และแก้ไขบัญชีสำหรับรับยอดเงินได้ที่นี่ค่ะ</p>
                    </div>
                  </div>

                  <form onSubmit={handleSaveSettings} className="space-y-4 max-w-2xl bg-[#1e1e24] p-5 rounded-2xl border border-white/10">
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="block text-[10px] text-stone-400 font-bold">ชื่อร้านค้า (Shop Name):</label>
                        <input 
                          type="text"
                          value={settingsForm.shopName}
                          onChange={(e) => setSettingsForm(prev => ({ ...prev, shopName: e.target.value }))}
                          placeholder="ตั้งชื่อแบรนด์หรือร้านค้าของคุณ..."
                          className="w-full bg-stone-950 border border-white/10 rounded-xl p-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-teal-500/40"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] text-stone-400 font-bold">สโลแกน / คำอธิบายร้านโดยย่อ:</label>
                        <textarea 
                          value={settingsForm.shopDescription}
                          onChange={(e) => setSettingsForm(prev => ({ ...prev, shopDescription: e.target.value }))}
                          placeholder="เช่น 'แหล่งรวมสินค้าหัตถกรรมจักสานใบลาน ตำบลน้ำน้อย คุณภาพระดับพรีเมียมคัดสรรพิเศษ'..."
                          className="w-full bg-stone-950 border border-white/10 rounded-xl p-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-teal-500/40"
                          rows={3}
                        />
                      </div>

                      <div className="p-4 rounded-2xl bg-stone-950/50 border border-white/5 space-y-3.5">
                        <h5 className="text-stone-300 font-bold text-xs uppercase border-b border-white/5 pb-1">รายละเอียดบัญชีธนาคารสำหรับรับยอดเงินโอนถอน</h5>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="block text-[10px] text-stone-400 font-bold">ธนาคารสำหรับถอนยอดเงินขาย:</label>
                            <select 
                              value={settingsForm.bankName}
                              onChange={(e) => setSettingsForm(prev => ({ ...prev, bankName: e.target.value }))}
                              className="w-full bg-stone-900 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-teal-500/40"
                            >
                              <option value="KBANK">ธนาคารกสิกรไทย (KBANK)</option>
                              <option value="SCB">ธนาคารไทยพาณิชย์ (SCB)</option>
                              <option value="BBL">ธนาคารกรุงเทพ (BBL)</option>
                              <option value="KTB">ธนาคารกรุงไทย (KTB)</option>
                              <option value="BAY">ธนาคารกรุงศรีอยุธยา (BAY)</option>
                              <option value="TTB">ธนาคารทหารไทยธนชาต (TTB)</option>
                              <option value="GSB">ธนาคารออมสิน (GSB)</option>
                              <option value="TRUEWALLET">ทรูมันนี่วอลเล็ท (TrueWallet)</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] text-stone-400 font-bold">เลขที่บัญชีธนาคาร:</label>
                            <input 
                              type="text"
                              value={settingsForm.bankAccountNumber}
                              onChange={(e) => setSettingsForm(prev => ({ ...prev, bankAccountNumber: e.target.value }))}
                              placeholder="เลขบัญชีรับเงินโอน..."
                              className="w-full bg-stone-900 border border-white/10 rounded-xl p-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-teal-500/40"
                              required
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] text-stone-400 font-bold">ชื่อบัญชีธนาคาร (ตรงกับบัตร):</label>
                            <input 
                              type="text"
                              value={settingsForm.bankAccountName}
                              onChange={(e) => setSettingsForm(prev => ({ ...prev, bankAccountName: e.target.value }))}
                              placeholder="ชื่อบัญชีรับเงิน..."
                              className="w-full bg-stone-900 border border-white/10 rounded-xl p-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-teal-500/40"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button 
                        type="submit"
                        disabled={settingsSubmitting}
                        className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-400 text-slate-950 font-black rounded-xl cursor-pointer shadow-lg shadow-teal-500/20 active:scale-95"
                      >
                        {settingsSubmitting ? "กำลังจัดเก็บ..." : "บันทึกข้อมูลการตั้งค่าร้านค้า"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

            </div>
          </div>
        )}

        {/* SHIP DIALOG FORM MODAL */}
        {shippingOrderId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <form onSubmit={handleShipOrder} className="relative w-full max-w-md rounded-3xl bg-[#1c1c21] border border-white/10 p-6 shadow-2xl space-y-4 animate-in fade-in duration-200">
              <h3 className="text-base font-extrabold text-white">📦 บันทึกรหัสการส่งสินค้าและพัสดุ</h3>
              <p className="text-[11px] text-stone-400 leading-normal">
                กรอกรายละเอียดบริการขนส่งที่ใช้ส่งของให้ลูกค้า เพื่อที่ลูกค้าจะสามารถติดตามเส้นทางของจากในหน้าเว็บได้เรียลไทม์ ยอดเงินขายจะค้ำประกันจนกว่าลูกค้าจะยืนยันพัสดุค่ะ
              </p>

              <div className="space-y-1">
                <label className="block text-[10px] text-stone-400">บริษัทผู้จัดส่ง (Carrier):</label>
                <input 
                  type="text"
                  value={shipForm.trackingCarrier}
                  onChange={(e) => setShipForm(prev => ({ ...prev, trackingCarrier: e.target.value }))}
                  placeholder="เช่น ไปรษณีย์ไทย, Kerry, Flash, J&T, LINE MAN..."
                  className="w-full bg-stone-900 border border-white/10 rounded-xl p-2.5 text-white text-xs placeholder-stone-600 focus:outline-none focus:border-amber-500/40"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] text-stone-400">เลขพัสดุ / รหัสติดตาม (Tracking Number):</label>
                <input 
                  type="text"
                  value={shipForm.trackingNumber}
                  onChange={(e) => setShipForm(prev => ({ ...prev, trackingNumber: e.target.value }))}
                  placeholder="รหัสติดตามพัสดุ (Tracking Number)..."
                  className="w-full bg-stone-900 border border-white/10 rounded-xl p-2.5 text-white text-xs placeholder-stone-600 focus:outline-none focus:border-amber-500/40 font-mono"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button"
                  onClick={() => setShippingOrderId(null)}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-[11px]"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit"
                  disabled={shipSubmitting}
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black rounded-lg text-[11px]"
                >
                  {shipSubmitting ? "กำลังบันทึกส่ง..." : "ยืนยันจัดส่งสำเร็จ ✓"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* CUSTOM ALERT MODAL */}
        {alert?.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-sm rounded-2xl bg-[#1c1c21] border border-white/10 p-5 shadow-2xl text-center space-y-4 animate-in zoom-in duration-200">
              {alert.type === "success" ? (
                <CheckCircle2 size={40} className="mx-auto text-emerald-500" />
              ) : (
                <ShieldAlert size={40} className="mx-auto text-red-500" />
              )}
              <h4 className="text-sm font-black text-white">{alert.title}</h4>
              <p className="text-[11px] text-stone-400 leading-normal">{alert.message}</p>
              <button 
                onClick={() => setAlert(null)}
                className="w-full py-2 bg-stone-800 hover:bg-stone-700 active:bg-stone-900 text-slate-200 font-bold rounded-xl transition-all cursor-pointer"
              >
                ตกลง
              </button>
            </div>
          </div>
        )}

        {/* CUSTOM CONFIRMATION MODAL */}
        {confirm?.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-sm rounded-2xl bg-[#1c1c21] border border-[#ff9800]/20 p-5 shadow-2xl text-center space-y-4 animate-in zoom-in duration-200">
              <ShieldAlert size={40} className="mx-auto text-amber-500 animate-bounce" />
              <h4 className="text-sm font-black text-white">{confirm.title}</h4>
              <p className="text-[11px] text-stone-400 leading-normal">{confirm.message}</p>
              <div className="flex items-center gap-2.5 pt-2">
                <button 
                  onClick={() => setConfirm(null)}
                  className="flex-1 py-2 bg-stone-800 hover:bg-stone-750 text-slate-300 font-bold rounded-xl transition-all cursor-pointer text-xs"
                >
                  ยกเลิก
                </button>
                <button 
                  onClick={confirm.onConfirm}
                  className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl transition-all cursor-pointer text-xs"
                >
                  ยืนยันลบ
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
