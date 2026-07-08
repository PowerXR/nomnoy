import React, { useState, useEffect } from "react";
import { Product, User, Coupon } from "../types";
import { X, ShoppingCart, Trash2, Plus, Minus, Ticket, MapPin, Truck, AlertCircle, Sparkles, Coins } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Language, getTranslation } from "../lib/translations";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: { productId: string; quantity: number }[];
  products: Product[];
  user: User | null;
  lang: Language;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: (
    shippingDetails: { name: string; phone: string; address: string; zip: string; method: string; fee: number },
    couponCode: string
  ) => Promise<boolean>;
  onOpenAuth: (type: "login" | "register") => void;
}

export default function CartModal({
  isOpen,
  onClose,
  cartItems,
  products,
  user,
  lang,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  onOpenAuth
}: CartModalProps) {
  const [couponInput, setCouponInput] = useState<string>("");
  const [couponApplied, setCouponApplied] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string>("");
  const [verifyLoading, setVerifyLoading] = useState<boolean>(false);
  const [checkoutLoading, setCheckoutLoading] = useState<boolean>(false);

  // Shipping details state
  const [shippingName, setShippingName] = useState<string>(user?.username || "");
  const [shippingPhone, setShippingPhone] = useState<string>("");
  const [shippingAddress, setShippingAddress] = useState<string>("");
  const [shippingZip, setShippingZip] = useState<string>("");
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");

  const shippingFees = {
    standard: 45,
    express: 85
  };

  const currentShippingFee = shippingFees[shippingMethod];

  // Update shipping name when user loads/changes
  useEffect(() => {
    if (user && !shippingName) {
      setShippingName(user.username);
    }
  }, [user]);

  if (!isOpen) return null;

  // Resolve cart items to products with details
  const resolvedItems = cartItems
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return {
        ...item,
        product
      };
    })
    .filter((item) => item.product !== undefined) as { productId: string; quantity: number; product: Product }[];

  const cartSubtotal = resolvedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Apply discount logic
  let discountAmount = 0;
  if (couponApplied) {
    if (couponApplied.discountPercent > 0) {
      discountAmount = parseFloat((cartSubtotal * (couponApplied.discountPercent / 100)).toFixed(2));
    } else if (couponApplied.discountBaht > 0) {
      discountAmount = Math.min(cartSubtotal, couponApplied.discountBaht);
    }
  }

  const finalTotal = Math.max(0, cartSubtotal - discountAmount + currentShippingFee);
  const isBalanceSufficient = user ? user.balance >= finalTotal : false;

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setVerifyLoading(true);
    setCouponError("");
    try {
      const resp = await fetch(`/api/coupons/verify?code=${encodeURIComponent(couponInput)}&price=${cartSubtotal}`);
      const data = await resp.json();
      if (resp.ok && data.success) {
        setCouponApplied(data.coupon);
        setCouponError("");
      } else {
        setCouponError(data.error || "รหัสคูปองไม่ถูกต้องหรือหมดอายุแล้ว");
        setCouponApplied(null);
      }
    } catch (err) {
      console.error(err);
      setCouponError("เกิดข้อผิดพลาดในการตรวจสอบคูปอง");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(null);
    setCouponInput("");
    setCouponError("");
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth("login");
      return;
    }
    if (resolvedItems.length === 0) return;

    if (!shippingName.trim() || !shippingPhone.trim() || !shippingAddress.trim() || !shippingZip.trim()) {
      alert("กรุณากรอกข้อมูลการจัดส่งให้ครบถ้วนก่อนทำการสั่งซื้อ");
      return;
    }

    if (!isBalanceSufficient) {
      alert("ยอดเงินของคุณไม่เพียงพอ กรุณาเติมเงินก่อนเพื่อสั่งซื้อสินค้า");
      return;
    }

    setCheckoutLoading(true);
    try {
      const success = await onCheckout(
        {
          name: shippingName,
          phone: shippingPhone,
          address: shippingAddress,
          zip: shippingZip,
          method: shippingMethod,
          fee: currentShippingFee
        },
        couponApplied?.code || ""
      );
      if (success) {
        handleRemoveCoupon();
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const themeButton = "bg-[#8E6D4E] hover:bg-[#725437] text-white shadow-md shadow-[#8E6D4E]/15 disabled:opacity-50 transition-all font-bold";
  const themeBorder = "border-[#8E6D4E]/15";

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-stone-950/60 backdrop-blur-sm transition-opacity"
      />

      {/* Cart Drawer */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="relative w-full max-w-lg h-full bg-[#FAF7F2] dark:bg-[#151210] shadow-2xl flex flex-col z-10 border-l border-[#8E6D4E]/10 text-[#4E3B2C] dark:text-stone-200"
      >
        {/* Header */}
        <div className="p-6 border-b border-[#8E6D4E]/10 flex items-center justify-between bg-stone-50 dark:bg-stone-900/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#8E6D4E]/10 text-[#8E6D4E]">
              <ShoppingCart size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif">ตะกร้าสินค้าของคุณ</h2>
              <p className="text-xs text-stone-500 font-light">มีสินค้าในตะกร้าทั้งหมด {resolvedItems.length} รายการ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-stone-200/50 dark:hover:bg-stone-800/50 transition-colors cursor-pointer text-stone-500"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {resolvedItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-850 flex items-center justify-center text-stone-400">
                <ShoppingCart size={32} />
              </div>
              <div>
                <p className="text-stone-600 dark:text-stone-400 font-bold">ตะกร้าสินค้าว่างเปล่า</p>
                <p className="text-xs text-stone-400 font-light mt-1">คุณสามารถเลือกดูผลิตภัณฑ์ชุมชนและเพิ่มลงตะกร้าได้ทันที</p>
              </div>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2.5 rounded-xl bg-[#8E6D4E] text-white hover:bg-[#725437] text-xs font-semibold cursor-pointer shadow-md transition-all active:scale-95"
              >
                ดูสินค้าชุมชนน้ำน้อย
              </button>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* Product List */}
              <div className="space-y-3">
                <h3 className="text-xs uppercase tracking-wider font-extrabold text-[#8E6D4E] mb-2 font-serif">รายการสินค้า</h3>
                <div className="space-y-3">
                  {resolvedItems.map(({ product, quantity }) => {
                    const maxStock = product.stock ? product.stock.length : 0;
                    return (
                      <div
                        key={product.id}
                        className="flex gap-4 p-4 rounded-2xl bg-white dark:bg-[#1C1815] border border-[#8E6D4E]/10 shadow-sm relative group overflow-hidden"
                      >
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-16 h-16 rounded-xl object-cover border border-stone-200 dark:border-stone-800"
                        />
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-[#4E3B2C] dark:text-stone-100 line-clamp-1">
                              {product.name}
                            </h4>
                            <p className="text-[10px] text-stone-400 font-light mt-0.5">
                              {product.sellerName ? `ร้าน: ${product.sellerName}` : "ตำบลน้ำน้อย"}
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm font-bold text-[#8E6D4E]">
                              {product.price.toLocaleString()} ฿
                            </span>

                            {/* Quantity Controls */}
                            <div className="bg-stone-50 dark:bg-[#151210] p-1 rounded-xl border border-[#8E6D4E]/10 flex items-center gap-2 select-none scale-90 origin-right">
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity(product.id, Math.max(1, quantity - 1))}
                                className="w-5.5 h-5.5 bg-white dark:bg-stone-800 hover:bg-[#8E6D4E]/10 rounded-lg text-stone-600 dark:text-stone-200 font-bold flex items-center justify-center cursor-pointer p-0 select-none text-[10px]"
                              >
                                <Minus size={10} />
                              </button>
                              <span className="text-xs font-bold text-[#4E3B2C] dark:text-stone-100 w-3 text-center">{quantity}</span>
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity(product.id, Math.min(maxStock, quantity + 1))}
                                className="w-5.5 h-5.5 bg-white dark:bg-stone-800 hover:bg-[#8E6D4E]/10 rounded-lg text-stone-600 dark:text-stone-200 font-bold flex items-center justify-center cursor-pointer p-0 select-none text-[10px]"
                              >
                                <Plus size={10} />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => onRemoveItem(product.id)}
                          className="absolute top-2 right-2 p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="ลบรายการนี้"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Coupon Section */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#1C1815] border border-[#8E6D4E]/10 space-y-3 shadow-sm">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#8E6D4E]">
                  <Ticket size={14} />
                  <span>สิทธิ์ส่วนลด / คูปอง</span>
                </div>

                {!couponApplied ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="รหัสคูปอง (เช่น DISCOUNT10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 px-3.5 py-2 rounded-xl border border-[#8E6D4E]/20 bg-[#FAF7F2] dark:bg-[#13100E] text-xs focus:outline-none focus:border-[#8E6D4E] placeholder:text-stone-400"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={verifyLoading || !couponInput.trim()}
                      className="px-4 py-2 bg-[#8E6D4E] hover:bg-[#725437] text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {verifyLoading ? "กำลังตรวจสอบ..." : "ใช้รหัส"}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/20">
                    <div className="flex items-center gap-2">
                      <Sparkles size={14} className="text-emerald-500" />
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        คูปอง [{couponApplied.code}] ลดได้ {couponApplied.discountPercent > 0 ? `${couponApplied.discountPercent}%` : `${couponApplied.discountBaht} ฿`}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-xs text-stone-500 hover:text-red-500 font-bold"
                    >
                      ยกเลิก
                    </button>
                  </div>
                )}
                {couponError && <p className="text-[10px] text-red-500 font-light">{couponError}</p>}
              </div>

              {/* Shipping Address Form */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#1C1815] border border-[#8E6D4E]/10 space-y-4 shadow-sm">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#8E6D4E] pb-2 border-b border-[#8E6D4E]/10">
                  <MapPin size={14} />
                  <span>ข้อมูลที่อยู่จัดส่งพัสดุ</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500">ชื่อ-นามสกุลผู้รับ</label>
                    <input
                      type="text"
                      required
                      value={shippingName}
                      onChange={(e) => setShippingName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#8E6D4E]/15 bg-[#FAF7F2] dark:bg-[#13100E] text-xs focus:outline-none focus:border-[#8E6D4E]"
                      placeholder="สมชาย ใจดี"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500">เบอร์โทรศัพท์มือถือ</label>
                    <input
                      type="text"
                      required
                      value={shippingPhone}
                      onChange={(e) => setShippingPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#8E6D4E]/15 bg-[#FAF7F2] dark:bg-[#13100E] text-xs focus:outline-none focus:border-[#8E6D4E]"
                      placeholder="08X-XXX-XXXX"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-500">ที่อยู่จัดส่งโดยละเอียด</label>
                  <textarea
                    required
                    rows={2}
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#8E6D4E]/15 bg-[#FAF7F2] dark:bg-[#13100E] text-xs focus:outline-none focus:border-[#8E6D4E]"
                    placeholder="บ้านเลขที่, ถนน, ตำบล, อำเภอ, จังหวัด"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500">รหัสไปรษณีย์</label>
                    <input
                      type="text"
                      required
                      value={shippingZip}
                      onChange={(e) => setShippingZip(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#8E6D4E]/15 bg-[#FAF7F2] dark:bg-[#13100E] text-xs focus:outline-none focus:border-[#8E6D4E]"
                      placeholder="90110"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500">วิธีจัดส่ง</label>
                    <select
                      value={shippingMethod}
                      onChange={(e) => setShippingMethod(e.target.value as "standard" | "express")}
                      className="w-full px-3 py-2 rounded-xl border border-[#8E6D4E]/15 bg-[#FAF7F2] dark:bg-[#13100E] text-xs focus:outline-none focus:border-[#8E6D4E]"
                    >
                      <option value="standard">ส่งธรรมดา (+45 ฿)</option>
                      <option value="express">ส่งด่วน EMS (+85 ฿)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/30 border border-[#8E6D4E]/10 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-500">ยอดรวมสินค้า (Subtotal):</span>
                  <span className="font-bold">{cartSubtotal.toLocaleString()} ฿</span>
                </div>
                {couponApplied && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>ส่วนลดคูปอง (Discount):</span>
                    <span>-{discountAmount.toLocaleString()} ฿</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-stone-500">ค่าจัดส่งพัสดุ (Shipping):</span>
                  <span>+{currentShippingFee} ฿</span>
                </div>
                <div className="h-[1px] bg-[#8E6D4E]/10 my-2" />
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-[#4E3B2C] dark:text-stone-100">ยอดชำระสุทธิ (Total to pay):</span>
                  <span className="text-lg font-black text-[#8E6D4E]">{finalTotal.toLocaleString()} ฿</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {user ? (
                  <>
                    {!isBalanceSufficient && (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex gap-2 text-xs">
                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">ยอดเงินคงเหลือของคุณไม่พอ</p>
                          <p className="text-[10px] font-light mt-0.5">ยอดเงินคงเหลือของคุณคือ {user.balance.toFixed(2)} ฿ ขาดอีก {(finalTotal - user.balance).toFixed(2)} ฿</p>
                        </div>
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={checkoutLoading || !isBalanceSufficient}
                      className={`w-full py-4 rounded-2xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                        !isBalanceSufficient ? "bg-stone-200 dark:bg-stone-850 text-stone-400 dark:text-stone-500 cursor-not-allowed shadow-none" : themeButton
                      }`}
                    >
                      <Coins size={15} />
                      <span>{checkoutLoading ? "กำลังดำเนินการสั่งซื้อ..." : `ยืนยันการชำระเงิน (${finalTotal.toLocaleString()} ฿)`}</span>
                    </button>
                  </>
                ) : (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center space-y-3">
                    <p className="text-xs font-bold text-amber-700 dark:text-amber-400">กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อสินค้าในตะกร้า</p>
                    <button
                      type="button"
                      onClick={() => onOpenAuth("login")}
                      className="w-full py-2.5 rounded-xl bg-[#8E6D4E] hover:bg-[#725437] text-white text-xs font-semibold cursor-pointer shadow-sm transition-all"
                    >
                      เข้าสู่ระบบเพื่อดำเนินการต่อ
                    </button>
                  </div>
                )}
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
