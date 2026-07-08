import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, ShoppingCart, Clock, ChevronRight, Sparkles } from "lucide-react";
import { Product } from "../types";

interface RecentPurchase {
  id: string;
  username: string;
  type: string;
  amount: number;
  details: string;
  date: string;
  status: string;
  productId?: string;
  imageUrl?: string;
}

interface RecentOrdersMarqueeProps {
  products: Product[];
  lang: string;
  onSelectProduct: (product: Product) => void;
  settings?: any;
}

function formatTimeAgo(dateString: string, lang: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.max(1, Math.floor(diffMs / 1000));
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);

  if (lang === "th") {
    if (diffSecs < 60) return "เมื่อสักครู่";
    if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
    if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
    if (diffDays < 30) return `${diffDays} วันที่แล้ว`;
    return `${diffMonths || 1} เดือนที่แล้ว`;
  } else {
    if (diffSecs < 60) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;
    return `${diffMonths || 1}mo ago`;
  }
}

export default function RecentOrdersMarquee({ products, lang, onSelectProduct, settings }: RecentOrdersMarqueeProps) {
  const [purchases, setPurchases] = useState<RecentPurchase[]>([]);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch initial recent purchases
  const fetchRecent = async () => {
    try {
      const res = await fetch("/api/purchases/recent?limit=12");
      if (res.ok) {
        const data = await res.json();
        
        // If we have real purchases, use them. If they are fewer than 4, pad with highly realistic local mock purchases
        // to ensure a beautiful continuous luxury rolling experience.
        if (data && data.length > 0) {
          if (data.length < 4) {
            const fallbackMocks: RecentPurchase[] = [
              {
                id: "tx-mock-1",
                username: "wi***47",
                type: "purchase_product",
                amount: 350,
                details: "ซื้อสินค้าจัดส่ง [บัตรเติมเงินน่ารักพรีเมียม]",
                date: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
                status: "completed"
              },
              {
                id: "tx-mock-2",
                username: "an***99",
                type: "purchase_box",
                amount: 150,
                details: "สุ่มกล่อง [กล่องของขวัญอธิษฐาน]",
                date: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
                status: "completed"
              },
              {
                id: "tx-mock-3",
                username: "ka***01",
                type: "purchase_product",
                amount: 490,
                details: "ซื้อสินค้าจัดส่ง [พวงกุญแจแฮนด์เมดน้ำน้อย]",
                date: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
                status: "completed"
              }
            ];
            setPurchases([...data, ...fallbackMocks]);
          } else {
            setPurchases(data);
          }
        } else {
          // If totally empty database, seed beautiful mock data
          setPurchases([
            {
              id: "tx-mock-1",
              username: "wi***47",
              type: "purchase_product",
              amount: 350,
              details: "ซื้อสินค้าจัดส่ง [บัตรสุ่มพรีเมียม]",
              date: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
              status: "completed"
            },
            {
              id: "tx-mock-2",
              username: "no***22",
              type: "purchase_product",
              amount: 500,
              details: "ซื้อสินค้าจัดส่ง [ไอดีเซตเริ่มต้นสุดคุ้ม]",
              date: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
              status: "completed"
            },
            {
              id: "tx-mock-3",
              username: "an***88",
              type: "purchase_box",
              amount: 199,
              details: "สุ่มกล่อง [กล่องนำโชคน้ำน้อยสีทอง]",
              date: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
              status: "completed"
            },
            {
              id: "tx-mock-4",
              username: "ch***55",
              type: "purchase_product",
              amount: 250,
              details: "ซื้อสินค้าจัดส่ง [สติกเกอร์ชุมชนกันน้ำ]",
              date: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
              status: "completed"
            }
          ]);
        }
      }
    } catch (e) {
      console.error("Error loading recent purchases:", e);
    }
  };

  useEffect(() => {
    fetchRecent();

    // Subscribe to SSE for real-time live purchase updates
    const eventSource = new EventSource("/api/purchases/live-stream");
    
    eventSource.onmessage = (event) => {
      try {
        const sseEvent = JSON.parse(event.data);
        if (sseEvent.type === "purchase") {
          const newTx = sseEvent.data as RecentPurchase;
          setPurchases((prev) => {
            // Remove mock items if real ones arrive to prioritize authenticity
            const filteredPrev = prev.filter((p) => !p.id.startsWith("tx-mock-"));
            
            // Avoid duplicates
            if (filteredPrev.some((p) => p.id === newTx.id)) return prev;
            
            // Prepend new purchase and cap at 12 items
            const updated = [newTx, ...filteredPrev].slice(0, 12);
            
            // If still too short for infinite loop (under 4 items), append mocks at the end
            if (updated.length < 4) {
              const filler = [
                {
                  id: "tx-mock-1",
                  username: "wi***47",
                  type: "purchase_product",
                  amount: 350,
                  details: "ซื้อสินค้าจัดส่ง [บัตรเติมเงินน่ารักพรีเมียม]",
                  date: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
                  status: "completed"
                },
                {
                  id: "tx-mock-2",
                  username: "an***99",
                  type: "purchase_box",
                  amount: 150,
                  details: "สุ่มกล่อง [กล่องของขวัญอธิษฐาน]",
                  date: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
                  status: "completed"
                }
              ];
              return [...updated, ...filler].slice(0, 12);
            }
            return updated;
          });
        }
      } catch (e) {
        // Safe fail-silent or log
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // Continuous Auto-Scroll Effect using requestAnimationFrame
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || purchases.length < 3) return;

    let animationId: number;
    
    // Determine speed dynamically based on backend admin settings
    let scrollSpeed = 0.55; // Default: normal
    if (settings?.recentOrdersSpeed === "slow") {
      scrollSpeed = 0.22;
    } else if (settings?.recentOrdersSpeed === "fast") {
      scrollSpeed = 1.05;
    } else if (settings?.recentOrdersSpeed === "vfast") {
      scrollSpeed = 1.85;
    }

    // Slow down slightly on hover for exquisite feel, but NEVER stop
    const getActiveSpeed = () => {
      return isHovered ? scrollSpeed * 0.35 : scrollSpeed;
    };

    const step = () => {
      if (el) {
        el.scrollLeft += getActiveSpeed();
        
        // Loop back seamlessly once we have scrolled past one full set
        const oneThird = el.scrollWidth / 3;
        if (el.scrollLeft >= oneThird * 2) {
          el.scrollLeft -= oneThird;
        }
      }
      animationId = requestAnimationFrame(step);
    };

    animationId = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [purchases, isHovered, settings?.recentOrdersSpeed]);

  // Style Configuration Helper
  const getStyleConfig = (styleName?: string) => {
    switch (styleName) {
      case "sunset-orange":
        return {
          card: "bg-gradient-to-r from-orange-500/10 to-red-500/15 border-orange-500/20 dark:from-orange-600/20 dark:to-red-600/25 dark:border-orange-500/30 hover:border-orange-400 dark:hover:border-orange-500 shadow-orange-500/5 hover:shadow-orange-500/15",
          btn: "text-orange-600 hover:bg-orange-50 border-orange-100",
          iconContainer: "bg-orange-500/10 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
          iconColor: "text-orange-500",
          glow: "from-orange-500/5 to-red-500/5"
        };
      case "emerald-green":
        return {
          card: "bg-gradient-to-r from-emerald-500/10 to-cyan-500/15 border-emerald-500/20 dark:from-emerald-600/20 dark:to-cyan-600/25 dark:border-emerald-500/30 hover:border-emerald-400 dark:hover:border-emerald-500 shadow-emerald-500/5 hover:shadow-emerald-500/15",
          btn: "text-emerald-600 hover:bg-emerald-50 border-emerald-100",
          iconContainer: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
          iconColor: "text-emerald-500",
          glow: "from-emerald-500/5 to-cyan-500/5"
        };
      case "crimson-rose":
        return {
          card: "bg-gradient-to-r from-rose-500/10 to-pink-500/15 border-rose-500/20 dark:from-rose-600/20 dark:to-pink-600/25 dark:border-rose-500/30 hover:border-rose-400 dark:hover:border-rose-500 shadow-rose-500/5 hover:shadow-rose-500/15",
          btn: "text-rose-600 hover:bg-rose-50 border-rose-100",
          iconContainer: "bg-rose-500/10 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
          iconColor: "text-rose-500",
          glow: "from-rose-500/5 to-pink-500/5"
        };
      case "luxury-gold":
        return {
          card: "bg-gradient-to-r from-amber-500/10 to-yellow-600/15 border-amber-500/20 dark:from-amber-600/20 dark:to-yellow-600/25 dark:border-amber-500/30 hover:border-amber-400 dark:hover:border-amber-500 shadow-amber-500/5 hover:shadow-amber-500/15",
          btn: "text-amber-600 hover:bg-amber-50 border-amber-100",
          iconContainer: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
          iconColor: "text-amber-500",
          glow: "from-amber-500/5 to-yellow-500/5"
        };
      case "cyberpunk-neon":
        return {
          card: "bg-gradient-to-r from-pink-500/10 to-cyan-500/15 border-pink-500/30 dark:from-pink-600/20 dark:to-cyan-600/25 dark:border-pink-500/40 hover:border-pink-400 dark:hover:border-cyan-400 shadow-pink-500/5 hover:shadow-cyan-500/15",
          btn: "text-pink-600 hover:bg-pink-50 border-pink-100",
          iconContainer: "bg-pink-500/10 text-pink-600 dark:bg-pink-500/10 dark:text-pink-400",
          iconColor: "text-pink-500",
          glow: "from-pink-500/5 to-cyan-500/5"
        };
      case "glass-monochrome":
        return {
          card: "bg-stone-500/5 border border-stone-200/40 backdrop-blur-md dark:bg-stone-800/10 dark:border-white/10 hover:border-stone-400 dark:hover:border-stone-500 shadow-stone-500/2 hover:shadow-stone-500/10",
          btn: "text-stone-600 hover:bg-stone-50 border-stone-100 dark:border-stone-800",
          iconContainer: "bg-stone-500/10 text-stone-600 dark:bg-stone-500/10 dark:text-stone-400",
          iconColor: "text-stone-500",
          glow: "from-stone-500/5 to-stone-600/5"
        };
      case "violet-indigo":
      default:
        return {
          card: "bg-gradient-to-r from-[#8b5cf6]/10 to-[#6366f1]/15 border border-[#8b5cf6]/25 dark:from-[#7c3aed]/20 dark:to-[#4f46e5]/25 dark:border-[#7c3aed]/30 shadow-lg shadow-indigo-500/5 hover:shadow-indigo-500/15 hover:border-violet-400 dark:hover:border-violet-500",
          btn: "text-violet-600 hover:bg-violet-50 border-violet-100",
          iconContainer: "bg-violet-600/10 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
          iconColor: "text-[#8b5cf6]",
          glow: "from-violet-500/5 to-indigo-500/5"
        };
    }
  };

  // Handler to open product detail modal
  const handleViewProduct = (tx: RecentPurchase) => {
    // 1. Find by productId
    if (tx.productId) {
      const found = products.find((p) => p.id === tx.productId);
      if (found) {
        onSelectProduct(found);
        return;
      }
    }

    // 2. Fallback to product name matching in brackets [Product Name]
    const match = tx.details.match(/\[(.*?)\]/);
    if (match && match[1]) {
      const prodName = match[1];
      const found = products.find((p) => p.name.toLowerCase() === prodName.toLowerCase());
      if (found) {
        onSelectProduct(found);
        return;
      }
    }
  };

  // Helper to get image URL for the item
  const getProductImage = (tx: RecentPurchase): string => {
    if (tx.imageUrl) return tx.imageUrl;

    // Fallback: look up in active products list
    if (tx.productId) {
      const found = products.find((p) => p.id === tx.productId);
      if (found?.imageUrl) return found.imageUrl;
    }

    const match = tx.details.match(/\[(.*?)\]/);
    if (match && match[1]) {
      const found = products.find((p) => p.name === match[1]);
      if (found?.imageUrl) return found.imageUrl;
    }

    // High quality universal placeholder image matching the style
    return "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60";
  };

  // Helper to extract clean product title
  const getCleanProductName = (tx: RecentPurchase): string => {
    const match = tx.details.match(/\[(.*?)\]/);
    if (match && match[1]) return match[1];
    return tx.details;
  };

  // If component is inactive in settings, or there are no purchases, do not render
  if (settings && settings.recentOrdersActive === false) return null;
  if (purchases.length === 0) return null;

  // Seamless triplication of items to achieve infinite scrolling
  const displayPurchases = purchases.length >= 3
    ? [
        ...purchases.map((p, idx) => ({ ...p, uniqueKey: `${p.id}-c1-${idx}` })),
        ...purchases.map((p, idx) => ({ ...p, uniqueKey: `${p.id}-c2-${idx}` })),
        ...purchases.map((p, idx) => ({ ...p, uniqueKey: `${p.id}-c3-${idx}` }))
      ]
    : purchases.map((p, idx) => ({ ...p, uniqueKey: `${p.id}-${idx}` }));

  const currentThemeStyle = getStyleConfig(settings?.recentOrdersStyle);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Title with icon exactly as in the mock */}
      <div className="flex items-center gap-2 mb-4 border-b border-stone-200/50 dark:border-stone-800/50 pb-3">
        <div className={`p-2 rounded-xl ${currentThemeStyle.iconContainer}`}>
          <Lock size={18} className="stroke-[2.5]" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <h2 className="text-sm sm:text-base font-black text-stone-900 dark:text-white tracking-tight font-sans">
            {lang === "th" ? "รายการสั่งซื้อ" : "Recent Orders"}
          </h2>
          <span className="text-[11px] font-medium text-stone-400 dark:text-stone-500 font-sans">
            {lang === "th" ? "(ล่าสุด)" : "(Live)"}
          </span>
        </div>
        <div className="ml-auto flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-wider animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>{lang === "th" ? "อัปเดตสด" : "Live Stream"}</span>
        </div>
      </div>

      {/* Outer marquee scrolling container with gradient mask overlays */}
      <div className="relative">
        {/* Left fade overlay */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#FAF7F2] dark:from-[#151210] to-transparent z-10 pointer-events-none" />
        {/* Right fade overlay */}
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#FAF7F2] dark:from-[#151210] to-transparent z-10 pointer-events-none" />

        {/* Scrollable Container with hover state hooks */}
        <div
          ref={scrollRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="flex gap-4 overflow-x-auto pb-4 pt-1 px-1 no-scrollbar select-none cursor-grab active:cursor-grabbing"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <AnimatePresence mode="popLayout">
            {displayPurchases.map((tx) => {
              const prodName = getCleanProductName(tx);

              return (
                <motion.div
                  key={tx.uniqueKey}
                  layoutId={tx.uniqueKey}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className={`w-[280px] sm:w-[350px] shrink-0 flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300 relative overflow-hidden group ${currentThemeStyle.card}`}
                >
                  {/* Glowing background animation decoration */}
                  <div className={`absolute -inset-2 bg-gradient-to-r ${currentThemeStyle.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur-md pointer-events-none`} />

                  <div className="flex items-center gap-3 relative z-10 flex-1 min-w-0">
                    {/* Thumbnail Image */}
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-violet-400/20 bg-stone-100 dark:bg-stone-900 shrink-0 shadow-inner relative">
                      <img
                        src={getProductImage(tx)}
                        alt={prodName}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {/* Status indicator badge */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                    </div>

                    {/* Transaction Text details */}
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[12px] font-black text-[#4E3B2C] dark:text-stone-100 truncate tracking-wide font-sans leading-snug">
                        {prodName}
                      </span>
                      
                      {/* Order status */}
                      <div className="flex items-center gap-1.5 text-[10px] text-stone-500 dark:text-stone-400 mt-1 font-medium font-sans">
                        <ShoppingCart size={11} className={currentThemeStyle.iconColor} />
                        <span className="truncate">
                          {lang === "th" 
                            ? `ถูกสั่งซื้อไปจำนวน 1 ชิ้น` 
                            : `Purchased 1 unit`}
                        </span>
                      </div>

                      {/* Timeago indicator */}
                      <div className="flex items-center gap-1 text-[9px] text-stone-400 dark:text-stone-500 mt-0.5 font-light font-sans">
                        <Clock size={10} />
                        <span>{formatTimeAgo(tx.date, lang)}</span>
                        <span className="mx-1">•</span>
                        <span className="font-mono text-[9px] opacity-80">{tx.username}</span>
                      </div>
                    </div>
                  </div>

                  {/* CTA BUTTON */}
                  <div className="ml-3 shrink-0 relative z-10">
                    <button
                      type="button"
                      onClick={() => handleViewProduct(tx)}
                      className={`px-3.5 py-1.5 rounded-full bg-white text-[11px] font-black border dark:border-transparent transition-all duration-200 flex items-center gap-0.5 shadow-sm active:scale-95 cursor-pointer hover:scale-105 ${currentThemeStyle.btn}`}
                    >
                      <span>{lang === "th" ? "ดูสินค้า" : "View"}</span>
                      <ChevronRight size={10} className="stroke-[3]" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
