import React, { useState, useEffect, useRef } from "react";
import { User, Conversation, Message, Notification, Product } from "../types";
import { 
  X, Send, Image, ShoppingBag, MapPin, FileText, CheckCheck, Upload, 
  Smile, ShieldAlert, Reply, Trash2, ArrowLeft, MoreVertical, 
  UserX, CheckCircle2, RefreshCw, Eye, MessageSquare, Shield,
  TrendingUp, BarChart3, AlertTriangle, Store, HelpCircle, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CommunityChatProps {
  user: User | null;
  onClose: () => void;
  products: Product[];
  lang?: "th" | "en";
  activeSellerId?: string | null; // pass from product page to pre-open chat
}

export default function CommunityChat({
  user,
  onClose,
  products = [],
  lang = "th",
  activeSellerId = null
}: CommunityChatProps) {
  // If not logged in
  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <div className="bg-white dark:bg-[#1E1A16] max-w-sm w-full rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-2xl relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer text-stone-500 dark:text-stone-400"
          >
            <X size={18} />
          </button>
          <div className="text-center space-y-4 pt-2">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-950/40 rounded-full flex items-center justify-center mx-auto text-red-600 dark:text-red-400">
              <ShieldAlert size={32} />
            </div>
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
              {lang === "th" ? "กรุณาเข้าสู่ระบบ" : "Please Login First"}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              {lang === "th" ? "ท่านจำเป็นต้องเข้าสู่ระบบสมาชิกตลาดชุมชนเพื่อทำรายการแชทสอบถามหรือสั่งซื้อสินค้าโดยตรงกับปราชญ์ชาวบ้านค่ะ" : "You need to log in to chat with community sellers directly."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Common UI State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [replyMsg, setReplyMsg] = useState<Message | null>(null);
  
  // Custom attachment states
  const [attachmentPanelOpen, setAttachmentPanelOpen] = useState(false);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [orderFormOpen, setOrderFormOpen] = useState(false);
  const [locationFormOpen, setLocationFormOpen] = useState(false);
  const [slipFormOpen, setSlipFormOpen] = useState(false);
  const [imageFormOpen, setImageFormOpen] = useState(false);
  const [chatImageUrl, setChatImageUrl] = useState("");

  // Order invoice form states
  const [invoiceProdName, setInvoiceProdName] = useState("");
  const [invoicePrice, setInvoicePrice] = useState("");
  const [invoiceQty, setInvoiceQty] = useState("1");

  // Location form states
  const [locAddress, setLocAddress] = useState("");
  const [locLat, setLocLat] = useState("7.0455");
  const [locLng, setLocLng] = useState("100.5212");

  // Online status list and typing states (real-time from SSE)
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});

  // Admin Dashboard State
  const [adminTab, setAdminTab] = useState<"monitor" | "dashboard">("dashboard");
  const [adminStats, setAdminStats] = useState<any>({
    totalRooms: 0,
    totalMessages: 0,
    messagesToday: 0,
    blockedRooms: 0,
    topShops: []
  });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  // Load and subscribe to real-time events via SSE
  useEffect(() => {
    fetchConversations();

    // Connect to SSE Stream
    const eventSource = new EventSource("/api/purchases/live-stream");

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === "chat_message") {
          const msg = data.message as Message;
          // If message is for currently open room
          if (activeConv && msg.conversationId === activeConv.id) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === msg.id)) return prev;
              return [...prev, msg];
            });
            // Auto mark as read on receipt if it's from someone else
            if (msg.senderId !== user.id) {
              markAsRead(activeConv.id);
            }
          }
          
          // Refresh list to update preview
          fetchConversationsQuietly();
        } 
        else if (data.type === "messages_read") {
          if (activeConv && data.conversationId === activeConv.id) {
            setMessages((prev) => 
              prev.map((m) => m.senderId === user.id ? { ...m, isRead: true } : m)
            );
          }
        } 
        else if (data.type === "typing") {
          if (activeConv && data.conversationId === activeConv.id && data.userId !== user.id) {
            setTypingUsers((prev) => ({ ...prev, [data.userId]: data.isTyping }));
          }
        } 
        else if (data.type === "message_deleted") {
          if (activeConv && data.conversationId === activeConv.id) {
            setMessages((prev) => 
              prev.map((m) => m.id === data.messageId ? { 
                ...m, 
                message: "ข้อความนี้ถูกลบไปแล้ว", 
                messageType: "text",
                image: undefined,
                productInfo: undefined,
                orderInfo: undefined,
                locationInfo: undefined
              } : m)
            );
          }
          fetchConversationsQuietly();
        } 
        else if (data.type === "conversation_status_updated") {
          if (activeConv && data.conversationId === activeConv.id) {
            setActiveConv((prev) => prev ? { ...prev, status: data.status } : null);
          }
          fetchConversationsQuietly();
        }
        else if (data.type === "new_conversation") {
          fetchConversationsQuietly();
        }
      } catch (err) {
        console.error("Error parsing SSE data:", err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [activeConv?.id]);

  // Load target conversation if activeSellerId is provided (e.g. clicked Chat from product)
  useEffect(() => {
    if (activeSellerId && user) {
      handleOpenSellerChat(activeSellerId);
    }
  }, [activeSellerId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  // Fetch all conversations
  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/chat/conversations", {
        headers: {
          "x-user-id": user.id,
          "x-user-role": user.role
        }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        const uniqueData = data.filter((c, idx, self) => 
          self.findIndex((item) => item.id === c.id) === idx
        );
        setConversations(uniqueData);
        
        // If an active conversation is selected, sync it
        if (activeConv) {
          const current = uniqueData.find((c) => c.id === activeConv.id);
          if (current) setActiveConv(current);
        }
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
    }
  };

  // Fetch quietly without changing current state triggers
  const fetchConversationsQuietly = async () => {
    try {
      const res = await fetch("/api/chat/conversations", {
        headers: {
          "x-user-id": user.id,
          "x-user-role": user.role
        }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        const uniqueData = data.filter((c, idx, self) => 
          self.findIndex((item) => item.id === c.id) === idx
        );
        setConversations(uniqueData);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch messages for a specific conversation
  const selectConversation = async (conv: Conversation) => {
    setActiveConv(conv);
    setMessages([]);
    setReplyMsg(null);
    setAttachmentPanelOpen(false);
    
    try {
      const res = await fetch(`/api/chat/conversations/${conv.id}/messages`, {
        headers: {
          "x-user-id": user.id,
          "x-user-role": user.role
        }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        const uniqueData = data.filter((m, idx, self) => 
          self.findIndex((item) => item.id === m.id) === idx
        );
        setMessages(uniqueData);
        // Mark as read
        markAsRead(conv.id);
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  };

  // Mark all messages as read
  const markAsRead = async (convId: string) => {
    try {
      await fetch(`/api/chat/conversations/${convId}/read`, {
        method: "POST",
        headers: {
          "x-user-id": user.id
        }
      });
      // Update unread count client-side immediately
      setConversations((prev) => 
        prev.map((c) => c.id === convId ? { ...c, unreadCount: 0 } : c)
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Handle opening chat from Product Details
  const handleOpenSellerChat = async (sellerId: string) => {
    try {
      const res = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id
        },
        body: JSON.stringify({ sellerId })
      });
      const conv = await res.json();
      if (conv && conv.id) {
        await fetchConversations();
        selectConversation(conv);
      }
    } catch (err) {
      console.error("Failed to initiate chat:", err);
    }
  };

  // Send message API
  const sendMessage = async (bodyPayload: Partial<Message>) => {
    if (!activeConv) return;

    try {
      const res = await fetch(`/api/chat/conversations/${activeConv.id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
          "x-user-role": user.role
        },
        body: JSON.stringify({
          ...bodyPayload,
          replyToId: replyMsg?.id,
          replyToMessage: replyMsg ? (replyMsg.message || "รูปภาพ/เอกสาร") : undefined
        })
      });

      const data = await res.json();
      if (data && data.id) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.id)) return prev;
          return [...prev, data];
        });
        setReplyMsg(null);
        setAttachmentPanelOpen(false);
        setInputText("");
        
        // Stop typing indicator on send
        sendTypingStatus(false);
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  // Text message send handler
  const handleSendText = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    sendMessage({
      message: inputText.trim(),
      messageType: "text"
    });
  };

  // Typing status broadcast
  const sendTypingStatus = async (typing: boolean) => {
    if (!activeConv) return;
    try {
      await fetch(`/api/chat/conversations/${activeConv.id}/typing`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id
        },
        body: JSON.stringify({ isTyping: typing })
      });
    } catch (e) {
      // safe ignore
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);

    if (!isTyping) {
      setIsTyping(true);
      sendTypingStatus(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTypingStatus(false);
    }, 2000);
  };

  // Soft Delete message
  const handleDeleteMessage = async (msgId: string) => {
    try {
      const res = await fetch(`/api/chat/messages/${msgId}`, {
        method: "DELETE",
        headers: {
          "x-user-id": user.id,
          "x-user-role": user.role
        }
      });
      if (res.ok) {
        setMessages((prev) => 
          prev.map((m) => m.id === msgId ? { 
            ...m, 
            message: "ข้อความนี้ถูกลบไปแล้ว", 
            messageType: "text",
            image: undefined,
            productInfo: undefined,
            orderInfo: undefined,
            locationInfo: undefined
          } : m)
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Close or Block room
  const handleUpdateStatus = async (status: "active" | "closed" | "blocked") => {
    if (!activeConv) return;
    try {
      const res = await fetch(`/api/chat/conversations/${activeConv.id}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
          "x-user-role": user.role
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setActiveConv((prev) => prev ? { ...prev, status } : null);
        fetchConversations();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Image Upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("ไฟล์รูปภาพต้องมีขนาดไม่เกิน 5MB");
      return;
    }

    setImageUploadLoading(true);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            filename: file.name,
            base64Data: base64
          })
        });
        const uploadRes = await res.json();
        if (uploadRes.url) {
          sendMessage({
            message: `รูปภาพ: ${file.name}`,
            messageType: "image",
            image: uploadRes.url
          });
        }
      } catch (err) {
        console.error("Image upload failed:", err);
        alert("ไม่สามารถอัปโหลดรูปภาพได้");
      } finally {
        setImageUploadLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Direct drop handler for Drag & Drop
  const handleFileDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("รองรับเฉพาะไฟล์รูปภาพเท่านั้น");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("ไฟล์รูปภาพต้องมีขนาดไม่เกิน 5MB");
      return;
    }

    setImageUploadLoading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            filename: file.name,
            base64Data: base64
          })
        });
        const uploadRes = await res.json();
        if (uploadRes.url) {
          sendMessage({
            message: `รูปภาพ (ลากวาง): ${file.name}`,
            messageType: "image",
            image: uploadRes.url
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setImageUploadLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Recommended Product Send
  const handleSendProduct = (product: Product) => {
    sendMessage({
      message: `แนะแนวสินค้า: ${product.name}`,
      messageType: "product",
      productInfo: {
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        description: product.description
      }
    });
    setProductPickerOpen(false);
  };

  // Custom Invoice/Bill order form submit
  const handleSendOrderForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceProdName.trim() || !invoicePrice || !invoiceQty) return;

    sendMessage({
      message: `สั่งซื้อหัตถศิลป์: ${invoiceProdName}`,
      messageType: "order",
      orderInfo: {
        id: `ORD-${Date.now().toString().substring(8)}`,
        productName: invoiceProdName,
        amount: parseFloat(invoicePrice) * parseInt(invoiceQty),
        status: "รอจัดส่ง",
        date: new Date().toLocaleDateString("th-TH")
      }
    });

    setInvoiceProdName("");
    setInvoicePrice("");
    setInvoiceQty("1");
    setOrderFormOpen(false);
  };

  // Custom Location send
  const handleSendLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locAddress.trim()) return;

    sendMessage({
      message: `พิกัดจัดส่ง: ${locAddress}`,
      messageType: "location",
      locationInfo: {
        lat: parseFloat(locLat),
        lng: parseFloat(locLng),
        address: locAddress
      }
    });

    setLocAddress("");
    setLocationFormOpen(false);
  };

  // Slip Upload simulation
  const handleSendSlip = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate payment slip using an unsplash slip template or direct upload
    sendMessage({
      message: "สลิปยืนยันการโอนเงินชำระค่าผลิตภัณฑ์ชุมชน",
      messageType: "paymentSlip",
      image: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=400&q=80"
    });
    setSlipFormOpen(false);
  };

  // Load Admin Stats
  const fetchAdminStats = async () => {
    try {
      const res = await fetch("/api/chat/admin/stats", {
        headers: {
          "x-user-role": user.role
        }
      });
      const data = await res.json();
      if (data && !data.error) {
        setAdminStats(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Moderation from Admin Monitor
  const handleAdminModerate = async (targetUserId: string, action: "suspend" | "activate") => {
    if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการ ${action === "suspend" ? "ระงับบัญชี" : "เปิดใช้งานบัญชี"} ผู้ใช้นี้?`)) {
      try {
        const res = await fetch("/api/chat/admin/moderate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-role": user.role
          },
          body: JSON.stringify({ targetUserId, action })
        });
        if (res.ok) {
          alert("ทำรายการสำเร็จสำเร็จ!");
          fetchConversations();
          fetchAdminStats();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Filter conversations based on search
  const filteredConvs = conversations.filter((c) => {
    const q = searchQuery.toLowerCase();
    if (user.role === "admin") {
      return c.customerName.toLowerCase().includes(q) || c.shopName.toLowerCase().includes(q);
    } else if (user.role === "seller_internal" || user.role === "seller_external") {
      return c.customerName.toLowerCase().includes(q);
    } else {
      return c.shopName.toLowerCase().includes(q);
    }
  }).filter((c, idx, self) => 
    self.findIndex((item) => item.id === c.id) === idx
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full h-full md:max-w-6xl md:h-[85vh] bg-[#FAF8F5] dark:bg-[#151210] text-stone-800 dark:text-stone-100 rounded-none md:rounded-3xl border border-stone-200/60 dark:border-white/5 shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Top Header */}
        <div className="bg-[#1C1815] text-[#ECE5D8] px-4 py-3 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#16A34A] flex items-center justify-center text-white text-sm font-bold shadow-sm">
              💬
            </div>
            <div>
              <h2 className="text-sm font-black tracking-wide leading-tight">
                {lang === "th" ? "แผงคุยสื่อสารชุมชนน้ำน้อย" : "Namnoi Market Real-Time Chat"}
              </h2>
              <p className="text-[10px] text-stone-400 font-medium">
                {user.role === "admin" ? "ระบบจัดการดูแลข้อความส่วนกลาง (Admin Center)" : 
                 user.role.startsWith("seller") ? `ช่องทางแผงร้านผู้ขาย: ${user.username}` : `ช่องทางผู้ซื้อ: ${user.username}`}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-stone-400 hover:text-stone-100 cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        {user.role === "admin" ? (
          // ==================== ADMIN LAYOUT ====================
          <div className="flex-1 flex flex-col md:flex-row min-h-0 bg-stone-50 dark:bg-stone-950">
            {/* Admin Side Nav */}
            <div className="w-full md:w-52 border-b md:border-b-0 md:border-r border-stone-200 dark:border-white/5 p-3 flex md:flex-col gap-2.5 bg-stone-100 dark:bg-stone-900/60 flex-shrink-0">
              <button 
                onClick={() => { setAdminTab("dashboard"); fetchAdminStats(); }}
                className={`flex-1 md:flex-initial py-2 px-3.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                  adminTab === "dashboard" ? "bg-[#16A34A] text-white shadow-md shadow-emerald-500/10" : "hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300"
                }`}
              >
                <BarChart3 size={15} />
                <span>แดชบอร์ดสถิติ</span>
              </button>
              <button 
                onClick={() => { setAdminTab("monitor"); }}
                className={`flex-1 md:flex-initial py-2 px-3.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                  adminTab === "monitor" ? "bg-[#16A34A] text-white shadow-md shadow-emerald-500/10" : "hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300"
                }`}
              >
                <Eye size={15} />
                <span>มอนิเตอร์แชทสด</span>
              </button>
            </div>

            {/* Admin Active Tab View */}
            <div className="flex-grow flex flex-col min-h-0">
              {adminTab === "dashboard" ? (
                // Dashboard Screen
                <div className="flex-grow p-6 overflow-y-auto space-y-6">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200/50 dark:border-white/5 shadow-sm space-y-1">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">ห้องแชทสะสมทั้งหมด</span>
                      <span className="text-2xl font-black text-[#16A34A]">{adminStats.totalRooms || 0}</span>
                      <span className="text-[9.5px] text-stone-500 block">ห้องสนทนาแยกตามร้านค้า</span>
                    </div>
                    <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200/50 dark:border-white/5 shadow-sm space-y-1">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">ข้อความทั้งหมดวันนี้</span>
                      <span className="text-2xl font-black text-amber-500">{adminStats.messagesToday || 0}</span>
                      <span className="text-[9.5px] text-stone-500 block">ส่งวันนี้โดยลูกค้าและผู้ขาย</span>
                    </div>
                    <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200/50 dark:border-white/5 shadow-sm space-y-1">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">ปริมาณข้อความรวม</span>
                      <span className="text-2xl font-black text-blue-500">{adminStats.totalMessages || 0}</span>
                      <span className="text-[9.5px] text-stone-500 block">ประวัติการคุยตั้งแต่เริ่มระบบ</span>
                    </div>
                    <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200/50 dark:border-white/5 shadow-sm space-y-1">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">ห้องที่ถูกบล็อกชั่วคราว</span>
                      <span className="text-2xl font-black text-red-500">{adminStats.blockedRooms || 0}</span>
                      <span className="text-[9.5px] text-stone-500 block">ระงับเนื่องจากส่งลิงก์แฝงผิดกฎ</span>
                    </div>
                  </div>

                  {/* Top Shops list */}
                  <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/50 dark:border-white/5 p-5 shadow-sm space-y-4">
                    <div>
                      <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                        <Store size={16} className="text-[#16A34A]" />
                        <span>ร้านค้าชุมชนที่มีการตอบโต้สอบถามสูงสุด</span>
                      </h3>
                      <p className="text-[10.5px] text-stone-500">เรียงตามจำนวนห้องแชทของลูกค้าที่สร้างขึ้นปรึกษาแนะแนวภูมิปัญญาบาติก/จักสาน</p>
                    </div>

                    <div className="space-y-3">
                      {adminStats.topShops && adminStats.topShops.length > 0 ? (
                        adminStats.topShops.map((shop: any, i: number) => (
                          <div key={shop.sellerId} className="flex items-center justify-between p-3 rounded-xl bg-stone-50 dark:bg-stone-950/40 border border-stone-200/30 dark:border-white/5">
                            <div className="flex items-center gap-2.5">
                              <span className="text-xs font-bold text-stone-400">{i + 1}</span>
                              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-[#16A34A] flex items-center justify-center font-bold text-sm">
                                {shop.shopName.charAt(0)}
                              </div>
                              <span className="text-xs font-bold text-stone-800 dark:text-stone-100">{shop.shopName}</span>
                            </div>
                            <span className="text-xs font-black text-[#16A34A]">{shop.count} ห้องแชท</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-stone-400 text-xs">
                          ยังไม่มีร้านค้าเปิดห้องแชทสะสมข้อมูลในระบบ
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                // Live Monitor View (Reuses conversation list + chat list in admin perspective)
                <div className="flex-1 flex flex-col md:flex-row min-h-0 bg-white dark:bg-stone-900">
                  {/* Left monitor list */}
                  <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-stone-200 dark:border-white/5 flex flex-col flex-shrink-0">
                    <div className="p-3 border-b border-stone-200/80 dark:border-white/5">
                      <input 
                        type="text" 
                        placeholder="🔍 ค้นหาห้องแชท ลูกค้า หรือร้านค้า..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-stone-100 dark:bg-stone-950/60 text-xs rounded-xl border border-stone-200/40 dark:border-white/5 p-2 px-3 focus:outline-none focus:border-[#16A34A]"
                      />
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      {filteredConvs.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => selectConversation(c)}
                          className={`w-full p-3.5 text-left border-b border-stone-200/40 dark:border-white/5 transition-all flex items-start gap-3 cursor-pointer ${
                            activeConv?.id === c.id ? "bg-stone-100 dark:bg-stone-950/50" : "hover:bg-stone-50 dark:hover:bg-stone-950/20"
                          }`}
                        >
                          <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center font-bold text-stone-700 dark:text-stone-300 text-xs flex-shrink-0">
                            {c.customerName.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-grow">
                            <div className="flex justify-between items-center mb-0.5">
                              <span className="text-[11.5px] font-black text-stone-900 dark:text-stone-100 truncate">{c.customerName}</span>
                              <span className="text-[9px] text-stone-400 flex-shrink-0">{new Date(c.lastMessageAt).toLocaleTimeString([], {hour: "2-digit", minute:"2-digit"})}</span>
                            </div>
                            <div className="text-[9.5px] text-[#16A34A] font-extrabold mb-1 truncate">คุยกับ: {c.shopName}</div>
                            <div className="text-[10px] text-stone-500 dark:text-stone-400 truncate leading-snug">{c.lastMessage}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right Chat History + Moderation Center */}
                  {activeConv ? (
                    <div className="flex-grow flex flex-col min-h-0 bg-stone-50 dark:bg-stone-950/10">
                      {/* Top Admin view details */}
                      <div className="p-3 border-b border-stone-200/80 dark:border-white/5 bg-white dark:bg-stone-900 flex justify-between items-center">
                        <div>
                          <h4 className="text-xs font-black text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                            <Shield size={14} className="text-red-500" />
                            <span>กำลังมอนิเตอร์แชทสด</span>
                          </h4>
                          <p className="text-[9.5px] text-stone-500 leading-tight">
                            ลูกค้า: <strong>{activeConv.customerName}</strong> คุยกับร้าน: <strong>{activeConv.shopName}</strong>
                          </p>
                        </div>

                        {/* Mod panel */}
                        <div className="flex gap-2">
                          {activeConv.status !== "blocked" ? (
                            <button 
                              onClick={() => handleUpdateStatus("blocked")}
                              className="bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 py-1.5 px-3 rounded-lg text-[10px] font-extrabold uppercase tracking-wide flex items-center gap-1 cursor-pointer hover:bg-red-200 dark:hover:bg-red-950/60"
                            >
                              <ShieldAlert size={12} />
                              <span>บล็อกปิดห้องแชท</span>
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleUpdateStatus("active")}
                              className="bg-emerald-100 dark:bg-emerald-950/30 text-[#16A34A] py-1.5 px-3 rounded-lg text-[10px] font-extrabold uppercase tracking-wide flex items-center gap-1 cursor-pointer hover:bg-emerald-200 dark:hover:bg-emerald-950/60"
                            >
                              <CheckCircle2 size={12} />
                              <span>ปลดบล็อกห้องแชท</span>
                            </button>
                          )}

                          <button 
                            onClick={() => handleAdminModerate(activeConv.customerId, "suspend")}
                            className="bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 py-1.5 px-3 rounded-lg text-[10px] font-extrabold uppercase tracking-wide flex items-center gap-1 cursor-pointer hover:bg-stone-300 dark:hover:bg-stone-700"
                          >
                            <UserX size={12} />
                            <span>ระงับบัญชีผู้ซื้อ</span>
                          </button>
                        </div>
                      </div>

                      {/* Msg history for Admin */}
                      <div className="flex-grow p-4 overflow-y-auto space-y-3.5">
                        {messages.filter((m, idx, self) => self.findIndex((item) => item.id === m.id) === idx).map((m) => {
                          const isFromCustomer = m.senderId === activeConv.customerId;
                          return (
                            <div key={m.id} className={`flex ${isFromCustomer ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-md p-3.5 rounded-2xl border flex flex-col space-y-1 ${
                                isFromCustomer 
                                  ? "bg-[#FCFAF7] dark:bg-[#1A1612] border-amber-500/15 text-amber-950 dark:text-stone-100" 
                                  : "bg-[#F2FDF5] dark:bg-[#101F15] border-emerald-500/15 text-emerald-950 dark:text-stone-100"
                              }`}>
                                <div className="flex items-center justify-between gap-6">
                                  <span className="text-[9px] font-extrabold uppercase tracking-wide opacity-60">
                                    {isFromCustomer ? `ลูกค้า: ${activeConv.customerName}` : `ผู้ขาย: ${activeConv.shopName}`}
                                  </span>
                                  <button 
                                    onClick={() => handleDeleteMessage(m.id)}
                                    className="p-1 hover:bg-red-100 dark:hover:bg-red-950/40 rounded text-red-500 cursor-pointer"
                                    title="ลบข้อความเนื่องจากละเมิดกฎ"
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                </div>
                                <p className="text-[11.5px] leading-relaxed font-medium">{m.message}</p>
                                <span className="text-[8px] text-stone-400 self-end block pt-0.5">{new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={chatEndRef} />
                      </div>
                    </div>
                  ) : (
                    <div className="flex-grow flex flex-col items-center justify-center p-6 text-center text-stone-400">
                      <MessageSquare size={36} className="text-[#16A34A]/50 mb-3 animate-pulse" />
                      <h4 className="text-xs font-bold text-stone-600 dark:text-stone-400">เลือกห้องแชทของคนในชุมชน</h4>
                      <p className="text-[10px] text-stone-500 max-w-xs mt-1 leading-relaxed">เข้าตรวจสอบบทสนทนาที่กำลังเกิดขึ้นสด ๆ เพื่อป้องกันสแปมหรือลิงก์มัลแวร์พรีเซ็ตแอบอ้าง</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          // ==================== SELLER / CUSTOMER LAYOUT ====================
          <div className="flex-grow flex min-h-0 relative">
            
            {/* 1. Left Conversation list */}
            <div className={`w-full md:w-80 border-r border-stone-200/60 dark:border-white/5 flex flex-col flex-shrink-0 bg-white dark:bg-[#1A1612] ${
              activeConv ? "hidden md:flex" : "flex"
            }`}>
              {/* Search Bar */}
              <div className="p-3 border-b border-stone-200/40 dark:border-white/5 bg-stone-50 dark:bg-stone-950/30">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder={lang === "th" ? "🔍 ค้นหาบทสนทนา..." : "🔍 Search chats..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white dark:bg-[#201B17] text-xs text-stone-900 dark:text-white rounded-xl border border-stone-200 dark:border-white/5 p-2 px-3 focus:outline-none focus:border-[#16A34A] leading-tight"
                  />
                </div>
              </div>

              {/* Chat Item List */}
              <div className="flex-grow overflow-y-auto divide-y divide-stone-100 dark:divide-white/5">
                {filteredConvs.length > 0 ? (
                  filteredConvs.map((c) => {
                    const isSellerView = user.role.startsWith("seller");
                    const displayName = isSellerView ? c.customerName : c.shopName;
                    const avatar = isSellerView ? c.customerAvatar : c.shopLogo;
                    const isBlocked = c.status === "blocked";
                    const hasUnread = c.unreadCount > 0;

                    return (
                      <button
                        key={c.id}
                        onClick={() => selectConversation(c)}
                        className={`w-full p-4 text-left flex items-start gap-3 cursor-pointer transition-all ${
                          activeConv?.id === c.id 
                            ? "bg-[#16A34A]/5 dark:bg-[#16A34A]/10 border-l-4 border-[#16A34A]" 
                            : "hover:bg-stone-50 dark:hover:bg-[#1D1714]"
                        }`}
                      >
                        <div className="relative flex-shrink-0">
                          <img 
                            src={avatar} 
                            alt={displayName} 
                            className="w-9 h-9 rounded-full object-cover border border-stone-200/40 dark:border-white/5"
                            referrerPolicy="no-referrer"
                          />
                          {/* Live/Online indicators */}
                          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#1A1612] bg-emerald-500" />
                        </div>

                        <div className="min-w-0 flex-grow">
                          <div className="flex justify-between items-center mb-0.5">
                            <span className={`text-[11.5px] truncate block ${hasUnread ? 'font-black text-stone-950 dark:text-white' : 'font-bold text-stone-800 dark:text-stone-200'}`}>
                              {displayName}
                            </span>
                            <span className="text-[8.5px] text-stone-400 font-medium">
                              {new Date(c.lastMessageAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between gap-2 pt-0.5">
                            <p className={`text-[10px] truncate leading-tight ${hasUnread ? 'font-bold text-stone-900 dark:text-stone-100' : 'text-stone-500 dark:text-stone-400'}`}>
                              {c.lastMessage}
                            </p>
                            
                            {hasUnread && (
                              <span className="w-4 h-4 bg-[#16A34A] text-white text-[8px] font-black rounded-full flex items-center justify-center animate-pulse">
                                {c.unreadCount}
                              </span>
                            )}
                          </div>

                          {isBlocked && (
                            <span className="inline-block mt-1 text-[8.5px] bg-red-100 dark:bg-red-950/40 text-red-600 px-1.5 py-0.5 rounded-md font-extrabold tracking-wide uppercase">
                              🚫 ระงับชั่วคราว
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-stone-400 px-4">
                    <MessageSquare size={32} className="mx-auto mb-2 text-stone-300 dark:text-stone-800 animate-pulse" />
                    <p className="text-[11px] font-medium">{lang === "th" ? "ยังไม่มีประวัติการพูดคุยในกล่องข้อความ" : "No conversation history found."}</p>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Right Chat screen */}
            <div className={`flex-grow flex flex-col bg-stone-50 dark:bg-[#120F0D] min-w-0 ${
              !activeConv ? "hidden md:flex" : "flex"
            }`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
            >
              {activeConv ? (
                // Active Room
                <>
                  {/* Active Room Top bar */}
                  <div className="px-4 py-3 bg-white dark:bg-[#1A1612] border-b border-stone-200/60 dark:border-white/5 flex items-center justify-between shadow-sm flex-shrink-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Mobile back button */}
                      <button 
                        onClick={() => setActiveConv(null)}
                        className="md:hidden p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 cursor-pointer mr-0.5"
                      >
                        <ArrowLeft size={18} />
                      </button>

                      <img 
                        src={user.role.startsWith("seller") ? activeConv.customerAvatar : activeConv.shopLogo} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full object-cover border border-stone-200/40 dark:border-white/5 flex-shrink-0"
                        referrerPolicy="no-referrer"
                      />

                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-stone-900 dark:text-stone-100 truncate">
                          {user.role.startsWith("seller") ? activeConv.customerName : activeConv.shopName}
                        </h4>
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[9px] text-stone-400 font-bold tracking-wide uppercase">ออนไลน์บนระบบ</span>
                        </div>
                      </div>
                    </div>

                    {/* Room actions: Seller can close or block customer */}
                    <div className="flex items-center gap-1.5">
                      {user.role.startsWith("seller") && activeConv.status === "active" && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleUpdateStatus("closed")}
                            className="bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-200 hover:scale-102 transition-all py-1.5 px-3 rounded-lg text-[9.5px] font-black uppercase tracking-wide cursor-pointer"
                          >
                            🔒 ปิดการคุยชั่วคราว
                          </button>
                          <button
                            onClick={() => handleUpdateStatus("blocked")}
                            className="bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-200 hover:scale-102 transition-all py-1.5 px-3 rounded-lg text-[9.5px] font-black uppercase tracking-wide cursor-pointer"
                          >
                            🚫 บล็อกผิดกฎ
                          </button>
                        </div>
                      )}

                      {activeConv.status === "blocked" && (
                        <span className="bg-red-150 dark:bg-red-950/40 text-red-600 py-1.5 px-3 rounded-lg text-[9.5px] font-black uppercase tracking-wider">
                          ⚠️ บล็อกปิดกั้น
                        </span>
                      )}

                      {activeConv.status === "closed" && (
                        <span className="bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400 py-1.5 px-3 rounded-lg text-[9.5px] font-black uppercase tracking-wider">
                          🔒 ห้องสนทนาปิดแล้ว
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Message History area */}
                  <div className="flex-grow p-4 overflow-y-auto space-y-4">
                    {messages.length > 0 ? (
                      messages.filter((m, idx, self) => self.findIndex((item) => item.id === m.id) === idx).map((m) => {
                        const isOwn = m.senderId === user.id;
                        
                        return (
                          <div 
                            key={m.id} 
                            className={`flex ${isOwn ? "justify-end" : "justify-start"} items-end gap-2 group`}
                          >
                            {/* Message Bubble container */}
                            <div className="flex flex-col space-y-0.5 max-w-[70%]">
                              {/* Reply quoted text */}
                              {m.replyToMessage && (
                                <div className="bg-stone-200/60 dark:bg-stone-800 text-[9.5px] p-2 rounded-t-xl border-l-2 border-[#16A34A] opacity-75 truncate -mb-1">
                                  <span className="font-bold text-[#16A34A] block mb-0.5">💬 อ้างถึงข้อความด้านบน:</span>
                                  {m.replyToMessage}
                                </div>
                              )}

                              <div className={`p-3.5 rounded-2xl border flex flex-col space-y-1 shadow-sm leading-relaxed ${
                                m.replyToMessage ? "rounded-t-none" : ""
                              } ${
                                isOwn 
                                  ? "bg-[#16A34A] text-white border-emerald-600/10 rounded-br-none" 
                                  : "bg-[#FCFAF7] dark:bg-[#1A1612] text-stone-900 dark:text-stone-100 border-stone-200/50 dark:border-white/5 rounded-bl-none"
                              }`}>
                                {/* Message content renderer */}
                                {m.messageType === "text" && (
                                  <p className="text-[11px] font-medium leading-relaxed font-sans">{m.message}</p>
                                )}

                                {m.messageType === "image" && m.image && (
                                  <div className="space-y-1.5">
                                    <img 
                                      src={m.image} 
                                      alt="Attachment" 
                                      className="rounded-xl max-w-full h-auto object-cover max-h-56 cursor-pointer hover:brightness-95"
                                      onClick={() => window.open(m.image, "_blank")}
                                    />
                                    {m.message && <p className="text-[10px] opacity-95">{m.message}</p>}
                                  </div>
                                )}

                                {m.messageType === "product" && m.productInfo && (
                                  <div className="bg-white dark:bg-[#25201B] p-2.5 rounded-xl border border-stone-200/50 dark:border-white/5 space-y-2 text-stone-800 dark:text-stone-100 w-52">
                                    <img src={m.productInfo.imageUrl} className="w-full h-24 object-cover rounded-lg" />
                                    <div>
                                      <span className="text-[10px] font-black text-[#16A34A] uppercase tracking-wider block">สินค้าชุมชนแนะนำ</span>
                                      <h5 className="text-[11px] font-bold truncate">{m.productInfo.name}</h5>
                                      <p className="text-[11px] font-black text-amber-600 mt-0.5">{m.productInfo.price.toLocaleString()} THB</p>
                                    </div>
                                    <button 
                                      onClick={() => alert("ระบบกำลังนำท่านไปยังกระบวนการเลือกสินค้าทำมือนี้...")}
                                      className="w-full py-1.5 bg-[#16A34A] text-white text-[9.5px] font-bold rounded-lg cursor-pointer"
                                    >
                                      สั่งซื้อสินค้านี้
                                    </button>
                                  </div>
                                )}

                                {m.messageType === "order" && m.orderInfo && (
                                  <div className="bg-amber-50 dark:bg-[#281D15] p-3 rounded-xl border border-dashed border-amber-300 dark:border-amber-600/30 text-stone-800 dark:text-stone-100 space-y-2 w-56 relative overflow-hidden">
                                    <div className="flex items-center justify-between border-b border-dashed border-stone-300 dark:border-white/10 pb-1.5 mb-1.5">
                                      <span className="text-[9.5px] font-black text-amber-700 dark:text-amber-400">🧾 ใบสรุปการสั่งซื้อ</span>
                                      <span className="text-[8px] font-bold bg-amber-200 text-amber-900 px-1 rounded">{m.orderInfo.id}</span>
                                    </div>
                                    <div className="space-y-1 text-[10px]">
                                      <div className="flex justify-between">
                                        <span className="text-stone-500">ผลิตภัณฑ์:</span>
                                        <span className="font-bold truncate max-w-[120px]">{m.orderInfo.productName}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-stone-500">สถานะ:</span>
                                        <span className="font-extrabold text-blue-600">{m.orderInfo.status}</span>
                                      </div>
                                      <div className="flex justify-between pt-1 border-t border-dashed border-stone-300 dark:border-white/5">
                                        <span className="font-extrabold">ยอดสุทธิ:</span>
                                        <span className="font-black text-amber-700 dark:text-amber-300">{m.orderInfo.amount.toLocaleString()} THB</span>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {m.messageType === "location" && m.locationInfo && (
                                  <div className="bg-sky-50 dark:bg-[#15232A] p-2.5 rounded-xl border border-sky-200 text-stone-800 dark:text-stone-100 w-52 space-y-1.5">
                                    <div className="flex items-center gap-1.5 text-sky-700 dark:text-sky-400">
                                      <MapPin size={14} />
                                      <span className="text-[10px] font-black uppercase tracking-wider">พิกัดจัดส่ง</span>
                                    </div>
                                    <p className="text-[10px] leading-relaxed font-bold">{m.locationInfo.address}</p>
                                    <div className="text-[8px] text-stone-400">Lat: {m.locationInfo.lat}, Lng: {m.locationInfo.lng}</div>
                                  </div>
                                )}

                                {m.messageType === "paymentSlip" && m.image && (
                                  <div className="bg-emerald-50 dark:bg-[#122419] p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-950/30 text-stone-800 dark:text-stone-100 w-52 space-y-2">
                                    <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
                                      <span className="text-[9.5px] font-black uppercase tracking-wider">💵 ยืนยันสลิปการโอน</span>
                                      <span className="text-[8px] font-bold bg-emerald-200 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 px-1 rounded flex items-center gap-0.5">
                                        <CheckCheck size={8} /> สำเร็จ
                                      </span>
                                    </div>
                                    <img src={m.image} className="w-full h-28 object-cover rounded" />
                                    <span className="text-[8px] text-stone-400 block text-center">สลิปตรวจสอบโดยธนาคารแล้ว</span>
                                  </div>
                                )}

                                {/* Meta area (Time and read receipt) */}
                                <div className="flex items-center justify-between gap-2 self-end pt-0.5">
                                  <span className={`text-[7.5px] ${isOwn ? 'text-emerald-100' : 'text-stone-400'}`}>
                                    {new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  </span>
                                  
                                  {isOwn && (
                                    <span className="text-[8px] opacity-75 flex items-center gap-0.5 text-emerald-100">
                                      {m.isRead ? (
                                        <>
                                          <CheckCheck size={10} />
                                          <span>อ่านแล้ว</span>
                                        </>
                                      ) : "ส่งแล้ว"}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Reply & Delete actions on hover (Desktop) */}
                            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                              <button 
                                onClick={() => setReplyMsg(m)}
                                className="p-1.5 bg-stone-100 dark:bg-stone-800 text-stone-500 rounded-full hover:scale-105 transition-all cursor-pointer"
                                title="ตอบกลับ/อ้างอิง"
                              >
                                <Reply size={12} />
                              </button>
                              
                              {isOwn && (
                                <button 
                                  onClick={() => handleDeleteMessage(m.id)}
                                  className="p-1.5 bg-stone-100 dark:bg-stone-800 text-red-500 rounded-full hover:scale-105 transition-all cursor-pointer"
                                  title="ลบข้อความนี้"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-stone-400">
                        <Smile size={32} className="text-stone-300 dark:text-stone-800 mb-2" />
                        <h5 className="text-xs font-bold text-stone-500">{lang === "th" ? "เริ่มสนทนาใหม่" : "No Messages Yet"}</h5>
                        <p className="text-[10px] text-stone-400 max-w-xs mt-1">พิมพ์ข้อความเพื่อสอบถามรายละเอียดสินค้าบาติกและผลิตภัณฑ์ทอใบลานพรีเมียมจากคุณลุงป้าในตำบลได้เลยค่ะ</p>
                      </div>
                    )}

                    {/* Remote typing state indicator */}
                    {Object.entries(typingUsers).some(([uid, isTyping]) => isTyping && uid !== user.id) && (
                      <div className="flex justify-start items-center gap-2">
                        <div className="bg-[#FCFAF7] dark:bg-[#1A1612] text-stone-500 border border-stone-200/50 dark:border-white/5 py-2 px-3 rounded-2xl text-[10px] font-bold flex items-center gap-2">
                          <span className="flex gap-0.5">
                            <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{animationDelay: "0ms"}} />
                            <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{animationDelay: "150ms"}} />
                            <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{animationDelay: "300ms"}} />
                          </span>
                          <span>กำลังพิมพ์คำตอบ...</span>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Attachment Pickers Overlay sheets */}
                  <AnimatePresence>
                    {productPickerOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="bg-white dark:bg-[#1E1A16] p-4 border-t border-stone-200 dark:border-white/5 space-y-3.5 flex-shrink-0"
                      >
                        <div className="flex justify-between items-center pb-2 border-b border-stone-100 dark:border-white/5">
                          <span className="text-xs font-black text-[#16A34A] uppercase tracking-wide">📦 คัดเลือกหัตถศิลป์แนะนำคุณผู้ซื้อ</span>
                          <button onClick={() => setProductPickerOpen(false)} className="text-stone-400 hover:text-stone-900 cursor-pointer"><X size={15} /></button>
                        </div>
                        <div className="flex gap-2.5 overflow-x-auto py-1">
                          {products.map((p) => (
                            <button
                              key={p.id}
                              onClick={() => handleSendProduct(p)}
                              className="bg-stone-50 dark:bg-stone-900 border border-stone-200/50 dark:border-white/5 p-2 rounded-xl text-left flex gap-2 w-52 flex-shrink-0 hover:border-[#16A34A] transition-all cursor-pointer"
                            >
                              <img src={p.imageUrl} className="w-11 h-11 object-cover rounded-md" />
                              <div className="min-w-0">
                                <h6 className="text-[10px] font-bold truncate text-stone-800 dark:text-stone-100">{p.name}</h6>
                                <p className="text-[10.5px] font-black text-amber-600 mt-0.5">{p.price.toLocaleString()} THB</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {orderFormOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="bg-white dark:bg-[#1E1A16] p-4 border-t border-stone-200 dark:border-white/5 space-y-3 flex-shrink-0"
                      >
                        <div className="flex justify-between items-center border-b border-stone-100 dark:border-white/5 pb-2">
                          <span className="text-xs font-black text-amber-700 dark:text-amber-400">🧾 สร้างใบเรียกเก็บเงิน / ใบสั่งซื้อสินค้าชุมชน</span>
                          <button onClick={() => setOrderFormOpen(false)} className="text-stone-400 cursor-pointer"><X size={15} /></button>
                        </div>
                        <form onSubmit={handleSendOrderForm} className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                          <div className="sm:col-span-2">
                            <label className="text-[9px] font-bold text-stone-500 block mb-0.5">ชื่อผลิตภัณฑ์ทอมือ</label>
                            <input 
                              required
                              type="text" 
                              placeholder="ระบุ เช่น ผ้าบาติกเขียนเทียนแท้" 
                              value={invoiceProdName}
                              onChange={(e) => setInvoiceProdName(e.target.value)}
                              className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 p-2 rounded-lg text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-stone-500 block mb-0.5">ราคาต่อหน่วย (THB)</label>
                            <input 
                              required
                              type="number" 
                              placeholder="เช่น 350" 
                              value={invoicePrice}
                              onChange={(e) => setInvoicePrice(e.target.value)}
                              className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 p-2 rounded-lg text-xs"
                            />
                          </div>
                          <div className="flex gap-2 items-end">
                            <div className="flex-1">
                              <label className="text-[9px] font-bold text-stone-500 block mb-0.5">จำนวน</label>
                              <input 
                                required
                                type="number" 
                                min="1"
                                value={invoiceQty}
                                onChange={(e) => setInvoiceQty(e.target.value)}
                                className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 p-2 rounded-lg text-xs"
                              />
                            </div>
                            <button type="submit" className="bg-[#16A34A] text-white font-bold p-2 px-3 rounded-lg flex-shrink-0 cursor-pointer">ส่ง</button>
                          </div>
                        </form>
                      </motion.div>
                    )}

                    {locationFormOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="bg-white dark:bg-[#1E1A16] p-4 border-t border-stone-200 dark:border-white/5 space-y-3 flex-shrink-0"
                      >
                        <div className="flex justify-between items-center border-b border-stone-100 dark:border-white/5 pb-2">
                          <span className="text-xs font-black text-sky-700">📍 ระบุพิกัด / ที่อยู่สำหรับจัดส่งผลงานหัตถกรรม</span>
                          <button onClick={() => setLocationFormOpen(false)} className="text-stone-400 cursor-pointer"><X size={15} /></button>
                        </div>
                        <form onSubmit={handleSendLocation} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                          <div className="sm:col-span-2">
                            <label className="text-[9px] font-bold text-stone-500 block mb-0.5">ที่อยู่โดยละเอียดในการนำจ่าย</label>
                            <input 
                              required
                              type="text" 
                              placeholder="ระบุ เช่น 99 ม.4 ถ.กาญจนวานิช ต.น้ำน้อย..." 
                              value={locAddress}
                              onChange={(e) => setLocAddress(e.target.value)}
                              className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 p-2 rounded-lg text-xs"
                            />
                          </div>
                          <div className="flex gap-2 items-end">
                            <div className="flex-1">
                              <label className="text-[9px] font-bold text-stone-500 block mb-0.5">ละติจูด (lat) / ลองจิจูด (lng)</label>
                              <div className="flex gap-1">
                                <input type="text" placeholder="7.0455" value={locLat} onChange={e => setLocLat(e.target.value)} className="w-1/2 bg-stone-50 border p-1 rounded-md text-[10px]" />
                                <input type="text" placeholder="100.5212" value={locLng} onChange={e => setLocLng(e.target.value)} className="w-1/2 bg-stone-50 border p-1 rounded-md text-[10px]" />
                              </div>
                            </div>
                            <button type="submit" className="bg-sky-600 text-white font-bold p-2 px-3 rounded-lg flex-shrink-0 cursor-pointer">ส่ง</button>
                          </div>
                        </form>
                      </motion.div>
                    )}

                    {slipFormOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="bg-white dark:bg-[#1E1A16] p-4 border-t border-stone-200 dark:border-white/5 space-y-3 flex-shrink-0"
                      >
                        <div className="flex justify-between items-center border-b border-stone-100 dark:border-white/5 pb-2">
                          <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">💵 อัปโหลดสลิปธนาคารเพื่อตรวจสอบความถูกต้อง</span>
                          <button onClick={() => setSlipFormOpen(false)} className="text-stone-400 cursor-pointer"><X size={15} /></button>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 items-center p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-dashed border-emerald-300 dark:border-emerald-600/30">
                          <div className="space-y-1 text-center sm:text-left">
                            <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">กดปุ่มถัดไปเพื่อส่งโมเดลสลิปจำลองการชำระเงิน OTOP</p>
                            <p className="text-[10px] text-stone-500">ระบบตรวจสอบสแกนสลิปด้วย OCR ดักสลิปปลอมแบบพรีเมียมทำงานร่วมกัน</p>
                          </div>
                          <button 
                            onClick={handleSendSlip}
                            className="bg-[#16A34A] text-white font-bold py-2 px-6 rounded-xl text-xs flex-shrink-0 hover:scale-102 transition-all cursor-pointer"
                          >
                            ตกลงส่งสลิปชำระเงิน
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {imageFormOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="bg-white dark:bg-[#1E1A16] p-4 border-t border-stone-200 dark:border-white/5 space-y-3 flex-shrink-0"
                      >
                        <div className="flex justify-between items-center border-b border-stone-100 dark:border-white/5 pb-2">
                          <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">🖼️ แนบรูปภาพจากอุปกรณ์หรือระบุลิงก์ URL</span>
                          <button onClick={() => setImageFormOpen(false)} className="text-stone-400 cursor-pointer"><X size={15} /></button>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Option 1: File selector */}
                          <div className="space-y-2 p-3 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200/50 dark:border-white/5 flex flex-col justify-center items-center text-center">
                            <span className="text-[10px] text-stone-400 uppercase font-bold">วิธีที่ 1: เลือกรูปภาพจากเครื่อง</span>
                            
                            <label className="flex flex-col items-center justify-center p-4 w-full h-24 rounded-xl border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-[#16A34A] hover:bg-[#16A34A]/5 transition-all cursor-pointer text-center space-y-1">
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => {
                                  handleImageUpload(e);
                                  setImageFormOpen(false);
                                }} 
                              />
                              <Upload size={18} className="text-emerald-600" />
                              <span className="text-xs font-bold text-stone-700 dark:text-stone-300">คลิกเพื่ออัปโหลดรูปภาพ</span>
                              <span className="text-[9px] text-stone-400">รองรับไฟล์รูปภาพทั่วไป ขนาดไม่เกิน 5MB</span>
                            </label>
                          </div>

                          {/* Option 2: Image URL input */}
                          <form 
                            onSubmit={(e) => {
                              e.preventDefault();
                              if (chatImageUrl.trim()) {
                                sendMessage({
                                  message: "แนบรูปภาพจากลิงก์ URL",
                                  messageType: "image",
                                  image: chatImageUrl.trim()
                                });
                                setChatImageUrl("");
                                setImageFormOpen(false);
                              }
                            }}
                            className="space-y-2 p-3 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200/50 dark:border-white/5 flex flex-col justify-between"
                          >
                            <span className="text-[10px] text-stone-400 uppercase font-bold">วิธีที่ 2: ระบุลิงก์ URL รูปภาพ</span>
                            
                            <div className="space-y-2 w-full flex flex-col gap-1.5">
                              <input 
                                type="url"
                                placeholder="https://example.com/image.jpg"
                                value={chatImageUrl}
                                onChange={(e) => setChatImageUrl(e.target.value)}
                                className="w-full bg-white dark:bg-stone-950 border border-stone-200 dark:border-white/10 rounded-xl p-2 text-xs focus:outline-none focus:border-[#16A34A] text-stone-800 dark:text-white"
                              />
                              <button
                                type="submit"
                                disabled={!chatImageUrl.trim()}
                                className="w-full bg-[#16A34A] text-white font-bold py-2 rounded-xl text-xs flex-shrink-0 hover:scale-102 transition-all cursor-pointer disabled:opacity-40"
                              >
                                ส่งรูปภาพจากลิงก์ URL
                              </button>
                            </div>
                          </form>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Reply quotation indicator bar inside typing area */}
                  {replyMsg && (
                    <div className="px-4 py-2 bg-stone-100 dark:bg-[#181512] border-t border-stone-200/60 dark:border-white/5 flex justify-between items-center flex-shrink-0">
                      <div className="text-[10px] text-stone-500 truncate flex items-center gap-1.5 min-w-0">
                        <Reply size={12} className="text-[#16A34A]" />
                        <span>กำลังอ้างอิงคำพูดของ: <strong>{replyMsg.message || "รูปภาพ/เอกสาร"}</strong></span>
                      </div>
                      <button 
                        onClick={() => setReplyMsg(null)}
                        className="p-1 rounded-full text-stone-400 hover:text-stone-900 dark:hover:text-white cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  {/* Input bottom bar */}
                  <div className="p-3 bg-white dark:bg-[#1A1612] border-t border-stone-200/60 dark:border-white/5 flex flex-col gap-2 flex-shrink-0">
                    
                    {/* Common quick emojis panel */}
                    <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
                      {["👍", "❤️", "🙏", "📦", "💵", "✨", "😊", "ขอบคุณครับ", "ยินดีต้อนรับครับ"].map((emo) => (
                        <button
                          key={emo}
                          onClick={() => setInputText(prev => prev + emo)}
                          className="px-2.5 py-1 bg-stone-150 dark:bg-[#28211C]/60 hover:bg-stone-200 hover:scale-102 transition-all text-stone-600 dark:text-stone-300 rounded-lg text-[10.5px] cursor-pointer flex-shrink-0"
                        >
                          {emo}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Plus Action button for Attachments panel */}
                      <button
                        onClick={() => setAttachmentPanelOpen(!attachmentPanelOpen)}
                        className={`p-2 rounded-full cursor-pointer transition-all ${
                          attachmentPanelOpen ? "bg-[#16A34A] text-white" : "hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500"
                        }`}
                        title="เครื่องมือแนบข้อมูล"
                      >
                        <motion.div animate={{ rotate: attachmentPanelOpen ? 45 : 0 }}>
                          <span className="text-lg font-black leading-none flex items-center justify-center h-4 w-4">+</span>
                        </motion.div>
                      </button>

                      {/* Input Box */}
                      <form onSubmit={handleSendText} className="flex-grow flex items-center gap-2 relative">
                        <input 
                          type="text" 
                          disabled={activeConv.status !== "active"}
                          value={inputText}
                          onChange={handleInputChange}
                          placeholder={
                            activeConv.status === "blocked" ? "ห้องแชทนี้ถูกปิดกั้นชั่วคราว" : 
                            activeConv.status === "closed" ? "ห้องสนทนาปิดการสนทนาแล้ว" :
                            lang === "th" ? "พิมพ์ข้อความแชทส่งที่นี่..." : "Type your message here..."
                          }
                          className="w-full bg-stone-50 dark:bg-[#201B17] text-stone-900 dark:text-white rounded-xl border border-stone-200 dark:border-white/5 p-2 px-3 focus:outline-none focus:border-[#16A34A] text-xs leading-normal disabled:opacity-50"
                        />
                        
                        <button 
                          type="submit"
                          disabled={activeConv.status !== "active" || !inputText.trim()}
                          className="p-2 rounded-xl bg-[#16A34A] text-white hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-40 flex-shrink-0"
                        >
                          <Send size={14} />
                        </button>
                      </form>
                    </div>

                    {/* Expandable attachment panel drawer */}
                    <AnimatePresence>
                      {attachmentPanelOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden grid grid-cols-3 sm:grid-cols-5 gap-2 pt-2 text-[10.5px] border-t border-stone-100 dark:border-white/5"
                        >
                          {/* File/URL input for images */}
                          <button
                            onClick={() => { setImageFormOpen(true); setProductPickerOpen(false); setOrderFormOpen(false); setLocationFormOpen(false); setSlipFormOpen(false); }}
                            className="flex flex-col items-center justify-center p-2 rounded-xl border border-stone-200 dark:border-white/5 hover:border-[#16A34A] hover:bg-[#16A34A]/5 transition-all text-center space-y-1 cursor-pointer"
                          >
                            <Image size={15} className="text-emerald-600" />
                            <span className="font-extrabold text-stone-700 dark:text-stone-300">แนบรูปภาพ</span>
                          </button>

                          {/* Recommendation Product */}
                          <button
                            onClick={() => { setProductPickerOpen(true); setImageFormOpen(false); setOrderFormOpen(false); setLocationFormOpen(false); setSlipFormOpen(false); }}
                            className="flex flex-col items-center justify-center p-2 rounded-xl border border-stone-200 dark:border-white/5 hover:border-[#16A34A] hover:bg-[#16A34A]/5 transition-all text-center space-y-1 cursor-pointer"
                          >
                            <ShoppingBag size={15} className="text-amber-600" />
                            <span className="font-extrabold text-stone-700 dark:text-stone-300">แนะนำสินค้า</span>
                          </button>

                          {/* Invoice / Bill (For Sellers mostly, but anyone can trigger) */}
                          <button
                            onClick={() => { setOrderFormOpen(true); setImageFormOpen(false); setProductPickerOpen(false); setLocationFormOpen(false); setSlipFormOpen(false); }}
                            className="flex flex-col items-center justify-center p-2 rounded-xl border border-stone-200 dark:border-white/5 hover:border-[#16A34A] hover:bg-[#16A34A]/5 transition-all text-center space-y-1 cursor-pointer"
                          >
                            <FileText size={15} className="text-blue-600" />
                            <span className="font-extrabold text-stone-700 dark:text-stone-300">เปิดบิล/สั่งซื้อ</span>
                          </button>

                          {/* Share Map coordinates */}
                          <button
                            onClick={() => { setLocationFormOpen(true); setImageFormOpen(false); setProductPickerOpen(false); setOrderFormOpen(false); setSlipFormOpen(false); }}
                            className="flex flex-col items-center justify-center p-2 rounded-xl border border-stone-200 dark:border-white/5 hover:border-[#16A34A] hover:bg-[#16A34A]/5 transition-all text-center space-y-1 cursor-pointer"
                          >
                            <MapPin size={15} className="text-red-600" />
                            <span className="font-extrabold text-stone-700 dark:text-stone-300">แนบตำแหน่ง</span>
                          </button>

                          {/* Payment Slip confirm */}
                          <button
                            onClick={() => { setSlipFormOpen(true); setImageFormOpen(false); setProductPickerOpen(false); setOrderFormOpen(false); setLocationFormOpen(false); }}
                            className="flex flex-col items-center justify-center p-2 rounded-xl border border-stone-200 dark:border-white/5 hover:border-[#16A34A] hover:bg-[#16A34A]/5 transition-all text-center space-y-1 cursor-pointer col-span-3 sm:col-span-1"
                          >
                            <CheckCheck size={15} className="text-emerald-500" />
                            <span className="font-extrabold text-stone-700 dark:text-stone-300">ส่งสลิปโอนเงิน</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                // Empty state right pane
                <div className="flex-grow flex flex-col items-center justify-center p-8 text-center text-stone-400">
                  <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center mb-4 text-[#16A34A]/30">
                    <MessageSquare size={44} className="animate-bounce duration-1000" />
                  </div>
                  <h4 className="text-xs font-black text-stone-700 dark:text-stone-300 tracking-wide uppercase">
                    {lang === "th" ? "ยินดีต้อนรับสู่กล่องแชทเทศบาลน้ำน้อย" : "Namnoi Market Messenger"}
                  </h4>
                  <p className="text-[10px] text-stone-500 max-w-sm mt-1 leading-relaxed">
                    {lang === "th" ? "เลือกพูดคุยสอบถามสินค้าช่างทอ ปราชญ์จักสานใบลาน ผลิตภัณฑ์ชุมชนโดยตรงได้อย่างรวดเร็วและปลอดภัย มีระบบแจ้งเตือนเมื่อคุณได้รับข้อความตอบรับ!" 
                     : "Choose a conversation on the left to start chatting about community crafts directly."}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
