import React, { useState, useEffect } from "react";
import { User, Transaction, AppSettings, Review } from "../types";
import { X, Calendar, DollarSign, Gift, Star, Clock, ShoppingBag, Eye, HeartHandshake, Truck, CheckCircle2, Copy, Cpu, Key, ShieldCheck, AlertCircle, MapPin, Activity, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Language, getTranslation } from "../lib/translations";

interface HistoryModalProps {
  user: User;
  settings: AppSettings;
  onClose: () => void;
  onAddReview: (productId: string, rating: number, comment: string) => Promise<any>;
  lang?: Language;
}

export default function HistoryModal({
  user,
  settings,
  onClose,
  onAddReview,
  lang = "th"
}: HistoryModalProps) {
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const getDigitalCode = (details: string) => {
    if (!details) return "";
    const parts = details.split(" - ");
    if (parts.length > 1) {
      let codePart = parts[1];
      if (codePart.includes(" | ")) {
        codePart = codePart.split(" | ")[0];
      }
      if (codePart.includes("ใช้โค้ด")) {
        codePart = codePart.split("ใช้โค้ด")[0];
      }
      return codePart.trim();
    }
    return "";
  };

  const getDigitalUpdates = (txDateStr: string) => {
    const dateObj = new Date(txDateStr);
    const step1Date = new Date(dateObj.getTime());
    const step2Date = new Date(dateObj.getTime() + 1500);
    const step3Date = new Date(dateObj.getTime() + 3000);
    
    return [
      {
        status: "preparing",
        date: step1Date.toISOString(),
        note: lang === "zh" ? "资金安全检测通过，已存入智能数字托管（Digital Escrow）" : lang === "en" ? "Digital support verified and placed in community secure digital escrow." : "ตรวจสอบความปลอดภัยและยอดอุดหนุนกองทุนชุมชนสำเร็จ พักยอดในระบบ Escrow"
      },
      {
        status: "shipped",
        date: step2Date.toISOString(),
        note: lang === "zh" ? "数字交货处理引擎成功分配并校验体验卡密密钥" : lang === "en" ? "Automatic dispatch system processed the license/voucher code." : "ระบบคำนวณและดึงรหัสใบแทนสิทธิ์หรือคีย์บริการระดับพรีเมียมเรียบร้อย"
      },
      {
        status: "delivered",
        date: step3Date.toISOString(),
        note: lang === "zh" ? "发货成功，产品激活序列号已部署完毕" : lang === "en" ? "E-ticket license and product code successfully deployed. Ready to redeem!" : "จัดส่งใบอนุญาตการรับบริการและจัดส่งคีย์รับสิทธิ์เรียบร้อยแล้ว คัดลอกรหัสเข้าใช้ได้เลย"
      }
    ];
  };

  // Custom alert & confirm dialog states for iframe environment
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const [alertDialog, setAlertDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  // Review Submitting states
  const [showReviewForm, setShowReviewForm] = useState<string | null>(null); // Transaction ID
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [reviewLoading, setReviewLoading] = useState(false);

  const fetchTxs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/transactions", {
        headers: {
          "X-User-Id": user.id,
          "X-User-Role": user.role
        }
      });
      const text = await res.text();
      if (text && !text.trim().startsWith("<")) {
        const data = JSON.parse(text);
        setTxs(data);
      } else {
        console.warn("Invalid non-JSON transactions data returned", text.slice(0, 100));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDeliver = (txId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "ยืนยันการรับสินค้า",
      message: "คุณได้รับสินค้าเรียบร้อยสมบูรณ์ดี และต้องการปล่อยยอดเงินค้ำประกัน (Escrow) ให้ผู้ขายเลยใช่หรือไม่?",
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          const res = await fetch(`/api/orders/${txId}/deliver`, {
            method: "POST",
            headers: {
              "X-User-Id": user.id
            }
          });
          if (res.ok) {
            setAlertDialog({
              isOpen: true,
              title: "ยืนยันรับสินค้าสำเร็จ",
              message: "ยืนยันรับพัสดุสำเร็จ! ปลดปล่อยเงินค้ำประกันส่งต่อแบรนด์ผู้ขายเรียบร้อยแล้วค่ะ",
              type: "success"
            });
            fetchTxs();
          } else {
            const err = await res.json();
            setAlertDialog({
              isOpen: true,
              title: "เกิดข้อผิดพลาด",
              message: err.error || "เกิดข้อผิดพลาดในการกดยืนยันค่ะ",
              type: "error"
            });
          }
        } catch (e) {
          setAlertDialog({
            isOpen: true,
            title: "เกิดข้อผิดพลาด",
            message: "การเชื่อมต่อล้มเหลว",
            type: "error"
          });
        }
      }
    });
  };

  useEffect(() => {
    fetchTxs();
  }, [user.id]);

  const handleReviewSubmit = async (e: React.FormEvent, tx: any) => {
    e.preventDefault();
    if (!reviewComment) return;

    // Map to updated products database
    let productId = "prod-3"; // Default Honey
    if (tx.details.includes("ผ้าบาติก") || tx.details.includes("Valorant")) productId = "prod-1";
    if (tx.details.includes("จักสาน") || tx.details.includes("สคริปต์")) productId = "prod-2";
    if (tx.details.includes("สปา") || tx.details.includes("สบู่") || tx.details.includes("VIP") || tx.details.includes("กล่องสุ่ม")) productId = "prod-4";

    setReviewLoading(true);
    try {
      await onAddReview(productId, reviewRating, reviewComment);
      const successAlert = lang === "zh" 
        ? "评价保存成功！非常感谢您对喃内社区非遗匠人家庭的支持！"
        : lang === "en"
        ? "Review successfully recorded! Thank you very much for supporting our local artisans!"
        : "บันทึกการรีวิวและมอบดวงดีให้กลุ่มวิสาหกิจน้ำน้อยประทับตราสำเร็จ! ขอบพระคุณอย่างยิ่งค่ะ";
      
      setAlertDialog({
        isOpen: true,
        title: lang === "zh" ? "评价成功" : lang === "en" ? "Review Recorded" : "รีวิวสำเร็จ",
        message: successAlert,
        type: "success"
      });
      setShowReviewForm(null);
      setReviewComment("");
    } catch (err) {
      console.error(err);
      setAlertDialog({
        isOpen: true,
        title: "เกิดข้อผิดพลาด",
        message: "เกิดข้อผิดพลาดในการส่งรีวิวค่ะ",
        type: "error"
      });
    } finally {
      setReviewLoading(false);
    }
  };

  const activeColor = "text-[#8E6D4E]";
  const badgeColors = (type: string) => {
    if (type.startsWith("topup_")) return "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20";
    return "bg-[#8E6D4E]/10 text-[#8E6D4E] border border-[#8E6D4E]/20";
  };

  const getTxTypeLabel = (type: string) => {
    if (type === "topup_qr") {
      return lang === "zh" ? "银行扫码充值" : lang === "en" ? "Bank QR Topup" : "กองทุนโอนกสิกรไทย";
    }
    if (type === "topup_angpao") {
      return lang === "zh" ? "口令红包充值" : lang === "en" ? "Gift Code Topup" : "ซองอุปการะคลัง";
    }
    return lang === "zh" ? "非遗工艺认购" : lang === "en" ? "Product Support" : "สนับสนุนหัตถศิลป์";
  };

  const getOrderStatusLabel = (status: string) => {
    if (status === "preparing") {
      return lang === "zh" ? "📦 正在准备商品" : lang === "en" ? "📦 Preparing Order" : "📦 กำลังเตรียมจัดส่ง";
    }
    if (status === "shipped") {
      return lang === "zh" ? "🚚 已发货" : lang === "en" ? "🚚 Shipped" : "🚚 ส่งแล้ว";
    }
    if (status === "delivered") {
      return lang === "zh" ? "✅ 已送达成功" : lang === "en" ? "✅ Delivered Successfully" : "✅ จัดส่งสำเร็จ";
    }
    return lang === "zh" ? "❌ 订单已取消" : lang === "en" ? "❌ Order Cancelled" : "❌ ยกเลิกคำสั่งซื้อ";
  };

  const getLocalizedDetails = (details: string) => {
    // Translate standard product names if found in the transaction log details
    let loc = details;
    if (lang === "en") {
      loc = loc.replace("ID Valorant ไฮแรค มีมีดแรร์พรีเมียม", "High-Rank Valorant ID");
      loc = loc.replace("สคริปต์ระบบร้านค้าอัตโนมัติ (PHP PDO Bootstrap 5)", "Automated Shop System Script");
      loc = loc.replace("Discord Nitro (1 Month) Gift Link", "Discord Nitro (1 Month) Gift");
      loc = loc.replace("กล่องสุ่ม VIP - โอกาสลุ้นรางวัลสุดสะท้านใจ!", "VIP Mystery Box (Gacha)");
    } else if (lang === "zh") {
      loc = loc.replace("ID Valorant ไฮแรค มีมีดแรร์พรีเมียม", "高段位 Valorant 账号（含稀有高级近战武器）");
      loc = loc.replace("สคริปต์ระบบร้านค้าอัตโนมัติ (PHP PDO Bootstrap 5)", "自动售货商城系统源码 (PHP PDO)");
      loc = loc.replace("Discord Nitro (1 Month) Gift Link", "Discord Nitro (1 个月) 礼物激活链接");
      loc = loc.replace("กล่องสุ่ม VIP - โอกาสลุ้นรางวัลสุดสะท้านใจ!", "VIP 豪华盲盒 - 心跳暴击赢取神秘大奖！");
    }
    return loc;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-950/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl rounded-3xl bg-[#FAF7F2] dark:bg-[#1C1815] border border-[#8E6D4E]/15 p-5 sm:p-7 shadow-2xl z-10 flex flex-col max-h-[92vh] md:max-h-[85vh] text-[#4E3B2C] dark:text-stone-200"
      >
        {/* Title */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#8E6D4E]/10 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Clock size={16} className={activeColor} />
            <h3 className="font-serif font-bold text-[#4E3B2C] dark:text-[#EAE3DA] text-base">
              {lang === "zh" ? "个人订单及账户财务明细记录" : lang === "en" ? "Order & Credit Transactions Ledger" : "ประวัติสั่งอุดหนุนและสมทบทุนชุมชน"}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 hover:text-[#8E6D4E] transition-all cursor-pointer hover:rotate-90 duration-250"
            title={getTranslation(lang, "close")}
          >
            <X size={16} />
          </button>
        </div>

        {/* List scroll panel */}
        <div className="flex-1 overflow-y-auto my-4 space-y-3.5 pr-1">
          {loading ? (
            <p className="text-center py-12 text-stone-400 text-xs animate-pulse">
              {lang === "zh" ? "正在读取您的专属交易账单..." : lang === "en" ? "Loading your transaction histories..." : "กำลังเรียกข้อมูลธุรกรรมส่วนบุคคล..."}
            </p>
          ) : txs.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-[#151210] rounded-2xl border border-[#8E6D4E]/15 shadow-sm">
              <p className="text-stone-400 text-xs font-light">
                {lang === "zh" ? "您当前在系统内暂无任何订单或充值记录。" : lang === "en" ? "You have no recorded transactions yet in your history." : "คุณยังไม่มีสถิติสั่งอุดหนุนสินค้าในประวัติขณะนี้"}
              </p>
            </div>
          ) : (
            txs.map((tx, idx) => (
              <div 
                key={`${tx.id}-${idx}`} 
                className="p-4 rounded-2xl bg-white dark:bg-[#151210] border border-[#8E6D4E]/10 space-y-2.5 hover:border-[#8E6D4E]/25 transition-all shadow-sm"
              >
                {/* Upper bar */}
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-bold ${badgeColors(tx.type)}`}>
                    {getTxTypeLabel(tx.type)}
                  </span>
                  <span className="text-[10px] text-stone-400 font-medium">
                    {new Date(tx.date).toLocaleDateString(lang === "zh" ? "zh-CN" : lang === "en" ? "en-US" : "th-TH")} {new Date(tx.date).toLocaleTimeString(lang === "zh" ? "zh-CN" : lang === "en" ? "en-US" : "th-TH")}
                  </span>
                </div>

                {/* Spec */}
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <p className="text-xs font-bold text-[#4E3B2C] dark:text-stone-200 leading-relaxed max-w-md">
                      {getLocalizedDetails(tx.details)}
                    </p>
                    <span className="text-[9.5px] text-stone-400 block mt-1 font-mono uppercase">
                      {lang === "zh" ? "交易流水号:" : lang === "en" ? "Transaction ID:" : "รหัสอ้างอิงธุรกรรม:"} #{tx.id}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-bold font-serif ${tx.type.startsWith("topup_") ? "text-emerald-600" : "text-[#8E6D4E]"}`}>
                      {tx.type.startsWith("topup_") ? "+" : "-"}{tx.amount.toLocaleString()} ฿
                    </span>
                    <span className="block text-[8px] text-emerald-600 uppercase font-bold mt-1">
                      {lang === "zh" ? "安全到账" : lang === "en" ? "Settled" : "ได้รับการบรรจุเรียบร้อย"}
                    </span>
                  </div>
                </div>

                {/* Gorgeous Package/Order Tracking Stepper */}
                {(tx.orderStatus || tx.type.startsWith("purchase_")) && (() => {
                  const isPhysical = !!tx.shippingDetails;
                  const orderStatus = tx.orderStatus || (isPhysical ? "preparing" : "delivered");
                  const digitalCode = getDigitalCode(tx.details);

                  const derivedUpdates = tx.statusUpdates && tx.statusUpdates.length > 0 
                    ? tx.statusUpdates 
                    : (isPhysical 
                        ? [
                            {
                              status: "preparing",
                              date: tx.date,
                              note: lang === "zh" ? "订单支付成功，商家正在打包商品..." : lang === "en" ? "Payment verified. Artisan has received the order and is preparing shipping pack..." : "ชำระเงินสำเร็จ ร้านค้าได้รับคำสั่งซื้อและกำลังจัดเตรียมบรรจุหัตถกรรมพรีเมียมน้ำน้อย"
                            }
                          ]
                        : getDigitalUpdates(tx.date)
                      );

                  const filteredUpdates = derivedUpdates.filter(update => {
                    if (orderStatus === 'preparing') return update.status === 'preparing';
                    if (orderStatus === 'shipped') return ['preparing', 'shipped'].includes(update.status || '');
                    return true;
                  });

                  return (
                    <div className="mt-3 p-4 bg-stone-50 dark:bg-[#1E1A17] rounded-2xl border border-[#8E6D4E]/15 space-y-3.5 shadow-xs">
                      {/* Carrier & Tracking number with copy utility / Digital Status Badge */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#8E6D4E]/10 pb-2.5">
                        <div className="flex items-center gap-2 text-[10.5px] font-extrabold text-[#4E3B2C] dark:text-[#EAE3DA]">
                          {isPhysical ? (
                            <Truck size={13} className="text-[#8E6D4E]" />
                          ) : (
                            <Cpu size={13} className="text-[#8E6D4E]" />
                          )}
                          <span className="tracking-wide">
                            {isPhysical 
                              ? (lang === "zh" ? "📦 实体邮寄追踪:" : lang === "en" ? "📦 Physical Shipping:" : "📦 การจัดส่งแบบพัสดุ:") 
                              : (lang === "zh" ? "⚡ 虚拟数字交付:" : lang === "en" ? "⚡ Digital Delivery:" : "⚡ การจัดส่งแบบดิจิทัล:")}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold ${
                            orderStatus === 'preparing' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' :
                            orderStatus === 'shipped' ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20' :
                            orderStatus === 'delivered' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
                            'bg-red-500/10 text-red-600 border border-red-500/20'
                          }`}>
                            {getOrderStatusLabel(orderStatus)}
                          </span>
                        </div>
                        
                        {isPhysical && tx.trackingNumber && (
                          <div className="flex items-center gap-1.5 text-[10px]">
                            <span className="text-stone-400">
                              {lang === "zh" ? "单号" : lang === "en" ? "Tracking" : "เลขพัสดุ"} ({tx.trackingCarrier || "Flash Express"}):
                            </span>
                            <span className="font-mono font-bold text-[#4E3B2C] dark:text-[#EAE3DA] select-all bg-stone-100 dark:bg-stone-900 px-1.5 py-0.5 rounded">{tx.trackingNumber}</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(tx.trackingNumber || "");
                                setAlertDialog({
                                  isOpen: true,
                                  title: lang === "zh" ? "复制成功" : lang === "en" ? "Copied" : "คัดลอกสำเร็จ",
                                  message: lang === "zh" ? "物流快递单号已成功复制到剪贴板！" : lang === "en" ? "Tracking number copied to clipboard!" : "คัดลอกเลขพัสดุเรียบร้อยแล้วค่ะ!",
                                  type: "success"
                                });
                              }}
                              className="p-1 bg-[#8E6D4E]/10 hover:bg-[#8E6D4E]/20 text-[#8E6D4E] rounded-md text-[8.5px] font-bold cursor-pointer transition-all active:scale-95 flex items-center gap-0.5"
                            >
                              <Copy size={9} />
                              <span>{lang === "zh" ? "复制" : lang === "en" ? "Copy" : "คัดลอก"}</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Stepper progress bar */}
                      {orderStatus !== 'cancelled' && (
                        <div className="py-1 px-1">
                          <div className="flex items-center justify-between text-[9px] font-black text-stone-400 relative">
                            {/* Progress Line */}
                            <div className="absolute top-[9px] left-3 right-3 h-0.5 bg-stone-200 dark:bg-stone-800 -z-0" />
                            <div 
                              className="absolute top-[9px] left-3 h-0.5 bg-[#8E6D4E] transition-all duration-500 -z-0" 
                              style={{
                                width: orderStatus === 'preparing' ? '15%' :
                                       orderStatus === 'shipped' ? '50%' : '100%'
                              }}
                            />

                            {/* Step 1 */}
                            <div className="flex flex-col items-center gap-1.5 z-10">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-all ${
                                ['preparing', 'shipped', 'delivered'].includes(orderStatus)
                                  ? "bg-[#8E6D4E] text-white shadow-sm"
                                  : "bg-stone-200 dark:bg-stone-800 text-stone-400"
                              }`}>
                                1
                              </div>
                              <span className={['preparing', 'shipped', 'delivered'].includes(orderStatus) ? "text-[#8E6D4E] font-bold" : ""}>
                                {isPhysical 
                                  ? (lang === "zh" ? "已下单" : lang === "en" ? "Ordered" : "รับออเดอร์")
                                  : (lang === "zh" ? "已付款" : lang === "en" ? "Paid" : "ชำระเงิน")}
                              </span>
                            </div>

                            {/* Step 2 */}
                            <div className="flex flex-col items-center gap-1.5 z-10">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-all ${
                                ['shipped', 'delivered'].includes(orderStatus)
                                  ? "bg-[#8E6D4E] text-white shadow-sm"
                                  : orderStatus === 'preparing'
                                  ? "bg-amber-500 text-white font-bold animate-pulse shadow-sm shadow-amber-500/20"
                                  : "bg-stone-200 dark:bg-stone-800 text-stone-400"
                              }`}>
                                2
                              </div>
                              <span className={['shipped', 'delivered'].includes(orderStatus) ? "text-[#8E6D4E] font-bold" : orderStatus === 'preparing' ? "text-amber-500 font-bold" : ""}>
                                {isPhysical 
                                  ? (lang === "zh" ? "备货中" : lang === "en" ? "Processing" : "เตรียมของ")
                                  : (lang === "zh" ? "处理中" : lang === "en" ? "Processing" : "จัดสรรคีย์")}
                              </span>
                            </div>

                            {/* Step 3 */}
                            <div className="flex flex-col items-center gap-1.5 z-10">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-all ${
                                orderStatus === 'delivered'
                                  ? "bg-[#8E6D4E] text-white shadow-sm"
                                  : orderStatus === 'shipped'
                                  ? "bg-blue-500 text-white font-bold animate-pulse shadow-sm shadow-blue-500/20"
                                  : "bg-stone-200 dark:bg-stone-800 text-stone-400"
                              }`}>
                                3
                              </div>
                              <span className={orderStatus === 'shipped' ? "text-blue-500 font-bold animate-pulse" : orderStatus === 'delivered' ? "text-[#8E6D4E] font-bold" : ""}>
                                {isPhysical 
                                  ? (lang === "zh" ? "已发货" : lang === "en" ? "Shipped" : "จัดส่งพัสดุ")
                                  : (lang === "zh" ? "已交付" : lang === "en" ? "Dispatched" : "ส่งมอบรหัส")}
                              </span>
                            </div>

                            {/* Step 4 */}
                            <div className="flex flex-col items-center gap-1.5 z-10">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-all ${
                                orderStatus === 'delivered'
                                  ? "bg-emerald-600 text-white font-bold shadow-sm shadow-emerald-500/20"
                                  : "bg-stone-200 dark:bg-stone-800 text-stone-400"
                              }`}>
                                ✓
                              </div>
                              <span className={orderStatus === 'delivered' ? "text-emerald-600 font-bold" : ""}>
                                {isPhysical 
                                  ? (lang === "zh" ? "已签收" : lang === "en" ? "Delivered" : "สำเร็จแล้ว")
                                  : (lang === "zh" ? "已激活" : lang === "en" ? "Secured" : "พร้อมใช้งาน")}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Digital Key Box if applicable */}
                      {!isPhysical && digitalCode && (
                        <div className="p-3 bg-amber-500/5 dark:bg-[#2A231D] rounded-xl border border-dashed border-[#8E6D4E]/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-inner">
                          <div className="flex items-center gap-2.5 min-w-0 w-full sm:w-auto">
                            <div className="p-2 rounded-lg bg-[#8E6D4E]/10 text-[#8E6D4E] flex-shrink-0">
                              <Key size={14} className="animate-pulse" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-[8.5px] uppercase tracking-wider text-stone-400 font-extrabold block">
                                {lang === "zh" ? "提取密匙 / 虚拟卡密" : lang === "en" ? "Dispatched Code / Voucher Key" : "รหัสคูปอง / คีย์ผลิตภัณฑ์จัดส่งสำเร็จ"}
                              </span>
                              <p className="text-xs font-mono font-extrabold text-[#8E6D4E] dark:text-amber-400 truncate select-all">{digitalCode}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(digitalCode);
                              setAlertDialog({
                                isOpen: true,
                                title: lang === "zh" ? "复制凭证成功" : lang === "en" ? "Voucher Copied" : "คัดลอกสำเร็จ",
                                message: lang === "zh" ? "虚拟商品提货密码已存入剪贴板！" : lang === "en" ? "Digital code voucher key copied to clipboard!" : "คัดลอกรหัสเข้ารับสิทธิ์เรียบร้อยแล้วค่ะ!",
                                type: "success"
                              });
                            }}
                            className="w-full sm:w-auto px-3.5 py-1.5 bg-[#8E6D4E] hover:bg-[#725437] text-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all shadow-md shadow-[#8E6D4E]/10 active:scale-95 flex-shrink-0"
                          >
                            <Copy size={11} />
                            <span>{lang === "zh" ? "一键复制" : lang === "en" ? "Copy Key" : "คัดลอกรหัส"}</span>
                          </button>
                        </div>
                      )}

                      {/* Physical Address Info */}
                      {isPhysical && tx.shippingDetails && (
                        <div className="p-3 bg-stone-100/50 dark:bg-stone-900/40 rounded-xl border border-[#8E6D4E]/5 text-[10.5px] space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-[#4E3B2C] dark:text-[#EAE3DA]">
                            <MapPin size={11} className="text-[#8E6D4E]" />
                            <span>{lang === "zh" ? "收货寄送地址:" : lang === "en" ? "Shipping Address:" : "ที่อยู่จัดส่งพัสดุ:"}</span>
                          </div>
                          <div className="pl-4 text-stone-500 dark:text-stone-400 space-y-0.5 font-light">
                            <p><span className="font-semibold text-stone-600 dark:text-stone-300">{tx.shippingDetails.name}</span> ({tx.shippingDetails.phone})</p>
                            <p>{tx.shippingDetails.address}, {tx.shippingDetails.zip}</p>
                            <p className="text-[9.5px] text-[#8E6D4E]/80 font-bold uppercase">{lang === "zh" ? "运送方案:" : lang === "en" ? "Method:" : "รูปแบบการขนส่ง:"} {tx.shippingDetails.method} (ค่าส่ง {tx.shippingDetails.fee} ฿)</p>
                          </div>
                        </div>
                      )}

                      {/* Timeline Updates */}
                      {filteredUpdates.length > 0 && (
                        <div className="border-t border-[#8E6D4E]/10 pt-2.5 space-y-1.5">
                          <div className="flex items-center gap-1">
                            <Activity size={10} className="text-[#8E6D4E] animate-pulse" />
                            <span className="text-[8.5px] font-extrabold uppercase tracking-wider text-stone-400 block">
                              {lang === "zh" ? "实时订单状态日志 (Real-time Logs):" : lang === "en" ? "Real-time Progress Timeline:" : "บันทึกสถานะการทำรายการล่าสุด (Real-time Logs):"}
                            </span>
                          </div>
                          <div className="space-y-2 max-h-24 overflow-y-auto pr-1">
                            {filteredUpdates.map((update: any, idx: number) => (
                              <div key={idx} className="flex gap-2 text-[9.5px] leading-relaxed">
                                <span className="text-stone-450 dark:text-stone-500 font-mono flex-shrink-0 font-semibold">
                                  {new Date(update.date).toLocaleString(lang === "zh" ? "zh-CN" : lang === "en" ? "en-US" : "th-TH", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit"
                                  })}
                                </span>
                                <span className="text-[#4E3B2C] dark:text-stone-300 font-medium">
                                  - {update.note}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Actions: Write review if is purchase */}
                {tx.type.startsWith("purchase_") && (
                  <div className="flex justify-end pt-1 border-t border-[#8E6D4E]/10">
                    {showReviewForm === tx.id ? (
                      <form onSubmit={(e) => handleReviewSubmit(e, tx)} className="w-full space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] text-stone-450 font-bold">
                            {lang === "zh" ? "1. 选择您对本次非遗手作质量的评分" : lang === "en" ? "1. Rate the artistry of this product" : "1. เลือกให้คะแนนความประณีตของชิ้นงาน"}
                          </label>
                          <div className="flex text-amber-500 gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setReviewRating(i + 1)}
                                className="cursor-pointer"
                              >
                                <Star size={13} className={i < reviewRating ? "fill-current text-amber-500" : "text-stone-300 opacity-30"} />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] text-stone-450 font-bold block mb-1">
                            {lang === "zh" ? "2. 撰写买家支持寄语或真实体验评论" : lang === "en" ? "2. Write review comments and wishes to artisans" : "2. เขียนความเห็นชื่นชมมงคลศิลปะชิ้นนี้"}
                          </label>
                          <textarea
                            required
                            placeholder={
                              lang === "zh" 
                                ? "宝贝做工非常精细，巴迪克蜡染的手绘图案独具匠心，包装也非常低碳环保，赞一个！" 
                                : lang === "en"
                                ? "This batik art is extremely beautiful and well-made. Eco-friendly organic packaging was great. Will buy again!"
                                : "ผ้าเขียนลายบาติกประณีตสวยงามมากเลยค่ะ สีครามธรรมชาติสว่างนวลตาตัดเย็บแล้วออกมางามสง่า อนาคตจะอุดหนุนใหม่แน่นอนค่ะ!"
                            }
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            rows={2}
                            className="w-full bg-[#FAF7F2] dark:bg-[#1C1815] border border-[#8E6D4E]/15 rounded-xl px-2.5 py-1.5 text-xs text-[#4E3B2C] dark:text-stone-200 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#8E6D4E]"
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button 
                            type="button" 
                            onClick={() => setShowReviewForm(null)}
                            className="bg-stone-100 dark:bg-stone-850 py-1.5 px-3 rounded-lg text-[10px] text-stone-500 cursor-pointer"
                          >
                            {lang === "zh" ? "取消" : lang === "en" ? "Cancel" : "ยกเลิก"}
                          </button>
                          <button
                            type="submit"
                            disabled={reviewLoading}
                            className="bg-[#8E6D4E] hover:bg-[#725437] text-white font-bold py-1.5 px-4 rounded-lg text-[10px] cursor-pointer"
                          >
                            {reviewLoading 
                              ? (lang === "zh" ? "发送中..." : lang === "en" ? "Submitting..." : "กำลังส่งบันทึก...") 
                              : (lang === "zh" ? "提交评价" : lang === "en" ? "Submit Review" : "ส่งคำวิจารณ์และคำอวยพร")}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex items-center gap-2">
                        {tx.orderStatus === 'shipped' && (
                          <button
                            onClick={() => handleConfirmDeliver(tx.id)}
                            className="py-1 px-3 text-[10px] rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black flex items-center gap-1 cursor-pointer transition-all hover:scale-105 shadow-md shadow-emerald-600/20"
                          >
                            <CheckCircle2 size={11} />
                            <span>ยืนยันรับสินค้า (ปล่อยเงินประกัน)</span>
                          </button>
                        )}
                        <button
                          onClick={() => setShowReviewForm(tx.id)}
                          className="py-1 px-2.5 text-[10px] rounded-lg border border-[#8E6D4E]/15 hover:bg-[#8E6D4E]/10 transition-all text-[#715437] dark:text-stone-300 flex items-center gap-1 cursor-pointer"
                        >
                          <HeartHandshake size={11} className={activeColor} />
                          <span>
                            {lang === "zh" ? "为本款工艺品撰写口碑评价" : lang === "en" ? "Write Review for Artisans" : "เขียนรีวิวให้คะแนนชิ้นงานชาวบ้าน"}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Custom Confirmation Dialog */}
        {confirmDialog?.isOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
            <div className="relative w-full max-w-sm rounded-2xl bg-[#FAF7F2] dark:bg-[#1C1815] border border-[#8E6D4E]/25 p-5 shadow-xl animate-fadeIn">
              <h3 className="text-sm font-bold text-[#4E3B2C] dark:text-[#EAE3DA] mb-2">{confirmDialog.title}</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mb-5 leading-relaxed">{confirmDialog.message}</p>
              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setConfirmDialog(null)}
                  className="px-3.5 py-1.5 rounded-lg text-[11px] bg-stone-100 dark:bg-stone-850 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400 font-bold transition-all cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={confirmDialog.onConfirm}
                  className="px-4 py-1.5 rounded-lg text-[11px] bg-[#8E6D4E] hover:bg-[#725437] text-white font-bold shadow-md shadow-[#8E6D4E]/15 transition-all cursor-pointer"
                >
                  ยืนยันทำรายการ
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Alert Dialog */}
        {alertDialog?.isOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
            <div className="relative w-full max-w-sm rounded-2xl bg-[#FAF7F2] dark:bg-[#1C1815] border border-[#8E6D4E]/25 p-5 shadow-xl animate-fadeIn">
              <h3 className="text-sm font-bold text-[#4E3B2C] dark:text-[#EAE3DA] mb-2 flex items-center gap-1.5">
                {alertDialog.type === "success" && <span className="text-emerald-600">✓</span>}
                {alertDialog.type === "error" && <span className="text-red-500">✗</span>}
                {alertDialog.type === "info" && <span className="text-amber-500">ℹ</span>}
                <span>{alertDialog.title}</span>
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mb-5 leading-relaxed">{alertDialog.message}</p>
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setAlertDialog(null)}
                  className="px-4 py-1.5 rounded-lg text-[11px] bg-[#8E6D4E] hover:bg-[#725437] text-white font-bold transition-all cursor-pointer"
                >
                  ตกลง
                </button>
              </div>
            </div>
          </div>
        )}

      </motion.div>
    </div>
  );
}
