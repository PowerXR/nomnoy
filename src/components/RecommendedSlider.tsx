import React, { useRef, useState, useEffect } from "react";
import { Product } from "../types";
import { ChevronLeft, ChevronRight, ShoppingCart, Eye, Star, Sparkles, Flame, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Language, getTranslation, getTranslatedProduct } from "../lib/translations";

interface RecommendedSliderProps {
  products: Product[];
  recommendProductIds: string[];
  lang: Language;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (productId: string, quantity: number) => void;
  recommendTitle?: string;
  recommendSubtitle?: string;
}

export default function RecommendedSlider({
  products,
  recommendProductIds,
  lang,
  onSelectProduct,
  onAddToCart,
  recommendTitle,
  recommendSubtitle
}: RecommendedSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Filter products by recommended IDs
  const recommendedList = products
    .filter((prod) => recommendProductIds.includes(prod.id))
    .map((prod) => getTranslatedProduct(prod, lang));

  // Update button visibility based on scroll position
  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll);
      // Run once initially and on resize
      checkScroll();
      window.addEventListener("resize", checkScroll);
    }
    return () => {
      if (el) {
        el.removeEventListener("scroll", checkScroll);
      }
      window.removeEventListener("resize", checkScroll);
    };
  }, [recommendedList.length]);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmt = direction === "left" ? -clientWidth * 0.75 : clientWidth * 0.75;
      scrollRef.current.scrollBy({ left: scrollAmt, behavior: "smooth" });
    }
  };

  if (recommendedList.length === 0) return null;

  return (
    <section id="luxury-recommend-section" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 scroll-mt-20">
      {/* Exquisite Luxury Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 relative">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8E6D4E]/10 border border-[#8E6D4E]/20 text-[#8E6D4E] text-[10px] font-extrabold uppercase tracking-widest">
            <Sparkles size={11} className="animate-pulse" />
            <span>{lang === "th" ? "คัดสรรพิเศษ" : lang === "zh" ? "臻选推荐" : "PREMIUM SELECTION"}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#4E3B2C] dark:text-[#E2C7A9] tracking-tight">
            {recommendTitle || (lang === "th" ? "🌟 สินค้าแนะนำพิเศษ" : "🌟 Curated Recommendations")}
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 font-light max-w-2xl leading-relaxed">
            {recommendSubtitle || (lang === "th" ? "คัดสรรสุดยอดหัตถศิลป์ระดับพรีเมียมของชุมชนน้ำน้อยที่ได้รับความนิยมสูง" : "A premium collection of the finest hand-crafted items and local masterpieces")}
          </p>
        </div>

        {/* Custom luxury control buttons */}
        <div className="flex items-center gap-2 mt-4 md:mt-0 select-none">
          <button
            onClick={() => handleScroll("left")}
            disabled={!canScrollLeft}
            className={`p-3 rounded-xl border transition-all duration-300 flex items-center justify-center cursor-pointer ${
              canScrollLeft
                ? "border-[#8E6D4E]/30 bg-white dark:bg-[#1C1815] text-[#8E6D4E] hover:bg-[#8E6D4E]/10 hover:scale-105"
                : "border-stone-200 dark:border-stone-800 text-stone-300 dark:text-stone-700 cursor-not-allowed opacity-50"
            }`}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => handleScroll("right")}
            disabled={!canScrollRight}
            className={`p-3 rounded-xl border transition-all duration-300 flex items-center justify-center cursor-pointer ${
              canScrollRight
                ? "border-[#8E6D4E]/30 bg-white dark:bg-[#1C1815] text-[#8E6D4E] hover:bg-[#8E6D4E]/10 hover:scale-105"
                : "border-stone-200 dark:border-stone-800 text-stone-300 dark:text-stone-700 cursor-not-allowed opacity-50"
            }`}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Exquisite Horizontal Sliding Container */}
      <div className="relative group/slider">
        {/* Subtle decorative shadows/gradients to hint scrolling on desktop */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#FAF7F2] dark:from-[#151210] to-transparent z-10 pointer-events-none transition-opacity duration-300" />
        )}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#FAF7F2] dark:from-[#151210] to-transparent z-10 pointer-events-none transition-opacity duration-300" />
        )}

        <motion.div
          ref={scrollRef}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.12,
                delayChildren: 0.1
              }
            }
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="flex gap-6 overflow-x-auto pb-6 pt-1 px-1 scroll-smooth no-scrollbar select-none snap-x"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {recommendedList.map((prod) => {
            const isOutOfStock = !prod.stock || prod.stock.length === 0;
            const stockCount = prod.stock ? prod.stock.length : 0;

            return (
              <motion.div
                key={prod.id}
                variants={{
                  hidden: { opacity: 0, y: 40, scale: 0.96 },
                  visible: { 
                    opacity: 1, 
                    y: 0, 
                    scale: 1,
                    transition: { type: "spring", stiffness: 70, damping: 14 }
                  }
                }}
                whileHover={{ 
                  y: -10,
                  scale: 1.015,
                  boxShadow: "0 25px 50px -12px rgba(142, 109, 78, 0.22)",
                  borderColor: "rgba(142, 109, 78, 0.45)"
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="w-[280px] sm:w-[320px] shrink-0 snap-start rounded-3xl bg-white dark:bg-[#1C1815] border border-[#8E6D4E]/10 shadow-lg shadow-[#8E6D4E]/5 transition-all duration-500 flex flex-col justify-between overflow-hidden group"
              >
                {/* Image and Badges Header */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100 dark:bg-stone-900">
                  <img
                    src={prod.imageUrl}
                    alt={prod.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                  />
                  {/* Stock and Seller badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                    <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-[#8E6D4E] text-white flex items-center gap-1 shadow-md">
                      <Flame size={10} className="text-yellow-300 animate-pulse" />
                      <span>RECOMMENDED</span>
                    </span>
                    {prod.sellerName && (
                      <span className="px-2.5 py-1 rounded-lg text-[9px] font-bold bg-stone-900/80 text-white backdrop-blur-sm self-start">
                        {prod.sellerName}
                      </span>
                    )}
                  </div>

                  {/* Rating / Sales overlay badge */}
                  <div className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-stone-950/70 backdrop-blur-sm text-yellow-400 text-[10px] font-bold flex items-center gap-1 shadow-sm z-10">
                    <Star size={11} fill="currentColor" />
                    <span>4.9</span>
                    <span className="text-white/60 font-light font-sans">|</span>
                    <span className="text-white font-medium">ขายแล้ว {prod.timesSold || 0} ชิ้น</span>
                  </div>

                  {/* Dark hover layer with buttons */}
                  <div className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-350 flex items-center justify-center gap-3 z-20">
                    <button
                      onClick={() => onSelectProduct(prod)}
                      className="p-3 rounded-full bg-white hover:bg-[#8E6D4E] text-[#8E6D4E] hover:text-white transition-all duration-300 shadow-lg cursor-pointer transform translate-y-3 group-hover:translate-y-0"
                      title={getTranslation(lang, "viewDetails")}
                    >
                      <Eye size={18} />
                    </button>
                    {!isOutOfStock && (
                      <button
                        onClick={() => onAddToCart(prod.id, 1)}
                        className="p-3 rounded-full bg-[#8E6D4E] hover:bg-[#725437] text-white transition-all duration-300 shadow-lg cursor-pointer transform translate-y-3 group-hover:translate-y-0 delay-75"
                        title="หยิบใส่ตะกร้า (Add to Cart)"
                      >
                        <ShoppingCart size={18} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Details Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black tracking-widest uppercase text-[#8E6D4E]">
                        {prod.type === "box" ? "GACHA BOX" : "OTOP ORIGINAL"}
                      </span>
                      {isOutOfStock ? (
                        <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded">
                          {getTranslation(lang, "outOfStockBtn")}
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                          <CheckCircle size={10} />
                          <span>{getTranslation(lang, "stock")}: {stockCount}</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-xs sm:text-sm font-bold text-[#4E3B2C] dark:text-stone-100 line-clamp-1 group-hover:text-[#8E6D4E] transition-colors duration-300 font-serif">
                      {prod.name}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-stone-500 dark:text-stone-400 font-light line-clamp-2 leading-relaxed h-8">
                      {prod.description}
                    </p>
                  </div>

                  {/* Price & Primary CTA */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-stone-100 dark:border-stone-800">
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase tracking-wider text-stone-400">SUPPORT VALUE</span>
                      <span className="text-sm sm:text-base font-serif font-black text-[#8E6D4E]">
                        {prod.price.toLocaleString()} ฿
                      </span>
                    </div>

                    <button
                      onClick={() => onSelectProduct(prod)}
                      className="px-3.5 py-1.5 rounded-xl text-[11px] font-extrabold bg-[#8E6D4E]/10 text-[#8E6D4E] hover:bg-[#8E6D4E] hover:text-white transition-all duration-300 flex items-center gap-1 cursor-pointer transform group-hover:scale-105 active:scale-95"
                    >
                      <span>รายละเอียด</span>
                      <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform duration-300" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
