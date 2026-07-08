import { useState } from "react";
import { Category, Product, AppSettings } from "../types";
import LucideIcon from "./LucideIcon";
import { Search, Flame, Sparkles, Layers, ChevronRight, CornerDownRight, Landmark, Palette, User, Heart, ShoppingCart } from "lucide-react";
import { motion } from "motion/react";
import { Language, getTranslation, getTranslatedCategory, getTranslatedProduct } from "../lib/translations";

interface CategoriesAndProductsProps {
  categories: Category[];
  products: Product[];
  settings: AppSettings;
  onSelectProduct: (product: Product) => void;
  lang?: Language;
  onAddToCart?: (productId: string, quantity: number) => void;
}

export default function CategoriesAndProducts({
  categories,
  products,
  settings,
  onSelectProduct,
  lang = "th",
  onAddToCart
}: CategoriesAndProductsProps) {
  const translatedCategories = categories.map(cat => getTranslatedCategory(cat, lang));
  const translatedProducts = products.map(prod => getTranslatedProduct(prod, lang));

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedShop, setSelectedShop] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Dynamically extract unique active shops from the products list
  const shops = products.reduce((acc: Array<{ id: string; name: string; description?: string }>, p) => {
    if (p.sellerId && p.sellerName) {
      if (!acc.some(s => s.id === p.sellerId)) {
        acc.push({
          id: p.sellerId,
          name: p.sellerName,
          description: p.sellerType === "internal" ? "Official Community Shop" : "Community Partner Shop"
        });
      }
    }
    return acc;
  }, []);

  const filteredProducts = translatedProducts.filter((p) => {
    const matchesCategory = selectedCategory === "all" || p.categoryId === selectedCategory;
    const matchesShop = selectedShop === "all" || p.sellerId === selectedShop;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesShop && matchesSearch;
  });

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8" id="recommended-products">
      
      {/* Meet Our Artisans / Cultural Context Section (Left/Right Layout in mockup) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20 items-center">
        <div className="lg:col-span-5 space-y-5">
          <span className="text-[#8E6D4E] dark:text-[#E2C7A9] font-sans text-xs font-semibold tracking-wide flex items-center gap-2">
            <span>{getTranslation(lang, "meetArtisans")}</span>
          </span>
          <h2 className="text-5xl sm:text-6xl font-serif text-[#4E3B2C] dark:text-[#FAF5EF] tracking-tight leading-[1.05] font-light">
            {getTranslation(lang, "artisansSectionTitle")} <br />
            <span className="font-serif italic font-normal text-[#8E6D4E] dark:text-[#E2C7A9]">{getTranslation(lang, "artisansSectionHighlight")}</span>
          </h2>
          <div className="flex items-center gap-3.5 py-1">
            <div className="h-[1px] w-20 bg-gradient-to-r from-transparent to-[#8E6D4E]/50" />
            <span className="text-[#8E6D4E] text-xs">✦</span>
            <div className="h-[1px] w-20 bg-gradient-to-l from-transparent to-[#8E6D4E]/50" />
          </div>
          <p className="text-stone-600 dark:text-stone-300 text-xs sm:text-[13.5px] leading-relaxed font-light">
            {getTranslation(lang, "artisansSectionBio")}
          </p>
          <div className="pt-2">
            <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-stone-150 dark:bg-[#1C1815]/50 border border-[#8E6D4E]/35 text-xs text-[#8E6D4E] dark:text-[#E2C7A9] font-medium shadow-sm">
              <Heart size={12} className="fill-[#8E6D4E] text-[#8E6D4E] animate-pulse" />
              <span>{getTranslation(lang, "sustainDirect")}</span>
            </span>
          </div>
        </div>
        <div className="lg:col-span-7 bg-gradient-to-br from-[#1C1815] to-[#0F0C0A] p-7 sm:p-9 rounded-[2.5rem] border border-[#8E6D4E]/25 flex flex-col sm:flex-row items-center gap-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#8E6D4E]/5 rounded-full blur-2xl pointer-events-none" />
          <div className="relative w-full sm:w-56 aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-stone-900 flex-shrink-0 border-2 border-white/90 shadow-lg group-hover:scale-[1.02] transition-transform duration-500">
            <img 
               src="https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=500&q=80" 
              alt="Artisan weaving textile" 
              className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
            />
          </div>
          <div className="space-y-4 flex-1">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-[#8E6D4E]/40 bg-[#8E6D4E]/10 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#E2C7A9]">
              <span>{getTranslation(lang, "featuredArtisanTag")}</span>
            </div>
            <h4 className="font-serif font-black text-xl text-white dark:text-[#E2C7A9] leading-tight tracking-tight">{getTranslation(lang, "featuredArtisanName")}</h4>
            <p className="text-[12px] sm:text-[13px] text-stone-300 leading-relaxed font-light italic">
              "{getTranslation(lang, "featuredArtisanQuote")}"
            </p>
          </div>
        </div>
      </div>

      {/* Categories header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-[#8E6D4E]/10 pb-6">
        <div>
          <span className="flex items-center gap-2 text-[10px] tracking-[0.2em] font-bold uppercase text-[#8E6D4E] dark:text-[#E2C7A9] mb-2 font-sans">
            <span>{getTranslation(lang, "curatedArtistryTag")}</span>
          </span>
          <h3 className="text-3xl font-serif text-[#4E3B2C] dark:text-[#FAF5EF] tracking-tight font-light">
            {getTranslation(lang, "curatedArtistryTitle")}
          </h3>
          <div className="flex items-center gap-3.5 mt-2">
            <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-[#8E6D4E]/40" />
            <span className="text-[#8E6D4E] text-xs">✦</span>
            <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-[#8E6D4E]/40" />
          </div>
        </div>

        {/* Search Input right-side */}
        <div className="relative w-full md:w-80 group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-stone-400 group-hover:text-[#8E6D4E] transition-colors">
            <Search size={14} />
          </div>
          <input
            type="text"
            placeholder={getTranslation(lang, "searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-full text-xs bg-white dark:bg-[#1A1613] border border-[#8E6D4E]/20 text-[#4E3B2C] dark:text-stone-200 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#8E6D4E] focus:border-[#8E6D4E] hover:border-[#8E6D4E]/40 shadow-sm transition-all font-light"
          />
        </div>
      </div>

      {/* Shops Horizontal Filter slider */}
      {shops.length > 0 && (
        <div className="mb-8 p-6 rounded-[2rem] bg-[#FAF7F2]/30 dark:bg-[#151210]/30 border border-[#8E6D4E]/10">
          <span className="flex items-center gap-1.5 text-[10px] tracking-[0.15em] font-black uppercase text-[#8E6D4E] dark:text-[#E2C7A9] mb-3.5">
            <Landmark size={12} className="text-[#8E6D4E]" />
            <span>{lang === 'en' ? 'CHOOSE STORE' : lang === 'zh' ? '选择商店' : 'เลือกชมแยกตามร้านค้าสมาชิก'}</span>
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedShop("all")}
              className={`px-4.5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer border ${
                selectedShop === "all"
                  ? "bg-[#8E6D4E] text-white border-[#8E6D4E] shadow-sm"
                  : "bg-white dark:bg-[#151210] text-[#735A45] dark:text-[#C5B49E] border-[#8E6D4E]/15 hover:border-[#8E6D4E]/40 shadow-xs"
              }`}
            >
              🏪 {lang === 'en' ? 'All Stores' : lang === 'zh' ? '所有商店' : 'ร้านค้าชุมชนทั้งหมด'}
            </button>
            
            {shops.map((shop) => (
              <button
                key={shop.id}
                onClick={() => setSelectedShop(shop.id)}
                className={`px-4.5 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer border flex items-center gap-2 ${
                  selectedShop === shop.id
                    ? "bg-[#8E6D4E] text-white border-[#8E6D4E] shadow-sm"
                    : "bg-white dark:bg-[#151210] text-[#735A45] dark:text-[#C5B49E] border-[#8E6D4E]/15 hover:border-[#8E6D4E]/40 shadow-xs"
                }`}
              >
                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${
                  selectedShop === shop.id ? "bg-white text-[#8E6D4E]" : "bg-[#8E6D4E]/10 text-[#8E6D4E]"
                }`}>
                  {shop.name.charAt(0).toUpperCase()}
                </div>
                <span>{shop.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Shop Banner */}
      {selectedShop !== "all" && (
        (() => {
          const activeShop = shops.find(s => s.id === selectedShop);
          if (!activeShop) return null;
          return (
            <div className="p-6 sm:p-8 rounded-[2.25rem] bg-[#FAF7F2] dark:bg-[#151210] border border-[#8E6D4E]/25 mb-8 flex flex-col md:flex-row items-start md:items-center gap-5 relative overflow-hidden shadow-md animate-fadeIn">
              <div className="absolute right-0 top-0 w-48 h-48 bg-[#8E6D4E]/5 rounded-full blur-2xl pointer-events-none animate-ping-slow" />
              <div className="w-16 h-16 rounded-[1.25rem] bg-[#8E6D4E] text-white flex items-center justify-center text-3xl font-serif font-black shadow-md flex-shrink-0">
                {activeShop.name.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h4 className="text-xl font-serif font-bold text-[#4E3B2C] dark:text-[#E2C7A9]">{activeShop.name}</h4>
                  <span className="text-[9px] px-2.5 py-0.5 rounded-full bg-[#8E6D4E]/10 border border-[#8E6D4E]/20 text-[#8E6D4E] font-bold">
                    {activeShop.description || "ร้านค้าสมาชิกชุมชนน้ำน้อย"}
                  </span>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 font-light leading-relaxed">
                  ยินดีต้อนรับสู่หน้าร้านค้าส่วนตัวสมาชิกกลุ่มศิลปะและหัตถกรรม ผลิตภัณฑ์ทั้งหมดของทางแบรนด์ผ่านเกณฑ์ประเมินความปลอดภัยสูงและรับประกันสิทธิ์ส่งพัสดุไวแท้ 100% ค่ะ
                </p>
              </div>
              <button 
                onClick={() => setSelectedShop("all")}
                className="px-4 py-2 bg-[#8E6D4E]/5 hover:bg-[#8E6D4E]/10 text-xs text-[#8E6D4E] font-bold rounded-xl transition-all cursor-pointer border border-[#8E6D4E]/15 self-start md:self-center hover:scale-102"
              >
                ดูร้านค้าอื่นทั้งหมด ✕
              </button>
            </div>
          );
        })()
      )}

      {/* Categories horizontal filter tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`relative overflow-hidden flex items-center gap-3.5 p-4 rounded-2xl border text-sm text-left transition-all duration-500 hover:-translate-y-0.5 cursor-pointer ${
            selectedCategory === "all"
              ? "bg-[#1E1916] dark:bg-[#1E1916] border-[#8E6D4E] shadow-lg shadow-[#8E6D4E]/20 text-white"
              : "bg-white dark:bg-[#151210] border-[#8E6D4E]/15 text-[#735A45] dark:text-[#C5B49E] hover:border-[#8E6D4E]/45"
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex-shrink-0 transition-all duration-300 flex items-center justify-center ${
            selectedCategory === "all" 
              ? "bg-gradient-to-br from-[#8E6D4E] to-[#725437] text-white shadow-md shadow-[#8E6D4E]/10" 
              : "bg-stone-100 dark:bg-stone-900/60 text-[#8E6D4E]"
          }`}>
            <Layers size={16} />
          </div>
          <div>
            <div className={`font-extrabold text-[13px] leading-tight ${selectedCategory === "all" ? "text-[#E2C7A9]" : "text-[#4E3B2C] dark:text-[#ECE5DD]"}`}>{getTranslation(lang, "allProductsTab")}</div>
            <div className={`text-[10px] mt-1 font-light ${selectedCategory === "all" ? "text-stone-300" : "text-stone-500 dark:text-stone-400"}`}>{getTranslation(lang, "allProductsDesc")}</div>
          </div>
        </button>

        {translatedCategories.map((cat, idx) => {
          const count = translatedProducts.filter((p) => p.categoryId === cat.id).length;
          const isSelected = selectedCategory === cat.id;
          const hasBg = !!cat.imageUrl;

          return (
            <button
              key={`${cat.id}-${idx}`}
              onClick={() => setSelectedCategory(cat.id)}
              style={hasBg && !isSelected ? { backgroundImage: `url(${cat.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
              className={`relative overflow-hidden flex items-center gap-3.5 p-4 rounded-2xl border text-sm text-left transition-all duration-500 hover:-translate-y-0.5 cursor-pointer ${
                isSelected
                  ? "bg-[#1E1916] dark:bg-[#1E1916] border-[#8E6D4E] shadow-lg shadow-[#8E6D4E]/20 text-white"
                  : hasBg
                    ? "border-[#8E6D4E]/20 text-white"
                    : "bg-white dark:bg-[#151210] border-[#8E6D4E]/15 text-[#735A45] dark:text-[#C5B49E] hover:border-[#8E6D4E]/45"
              }`}
            >
              {/* If has bg image and not selected, render overlay */}
              {hasBg && !isSelected && (
                <div className="absolute inset-0 bg-gradient-to-r from-stone-950/85 via-stone-950/65 to-stone-950/45 hover:from-stone-950/75 hover:via-stone-950/55 hover:to-stone-950/35 transition-all duration-500 z-0" />
              )}

              <div className={`w-10 h-10 rounded-xl flex-shrink-0 transition-all duration-300 flex items-center justify-center relative z-10 ${
                isSelected 
                  ? "bg-gradient-to-br from-[#8E6D4E] to-[#725437] text-white shadow-md shadow-[#8E6D4E]/10" 
                  : hasBg 
                    ? "bg-white/10 text-white" 
                    : "bg-stone-100 dark:bg-stone-900/60 text-[#8E6D4E]"
              }`}>
                <LucideIcon name={cat.icon || "Box"} size={16} />
              </div>

              <div className="min-w-0 flex-1 relative z-10">
                <div className={`font-extrabold text-[13px] leading-tight truncate ${
                  isSelected 
                    ? "text-[#E2C7A9]" 
                    : hasBg 
                      ? "text-white" 
                      : "text-[#4E3B2C] dark:text-[#ECE5DD]"
                }`}>
                  {cat.name}
                </div>
                <div className={`text-[10px] mt-1 font-light truncate ${
                  isSelected 
                    ? "text-stone-300" 
                    : hasBg 
                      ? "text-stone-300" 
                      : "text-stone-500 dark:text-stone-400"
                }`}>
                  {cat.description || `${count} ${getTranslation(lang, "countItems")}`}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Grid listing */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-24 bg-[#FCFAF7]/40 dark:bg-stone-900/20 border border-dashed border-[#8E6D4E]/20 rounded-[2rem]">
          <p className="text-stone-400 text-sm font-light">{getTranslation(lang, "noCuratedProducts")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((prod, idx) => {
            const isOutOfStock = prod.stock.length < 1;
            return (
              <motion.div
                key={`${prod.id}-${idx}`}
                layout
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col overflow-hidden rounded-[1.75rem] border border-[#8E6D4E]/10 bg-white dark:bg-[#1A1613] hover:shadow-2xl hover:border-[#8E6D4E]/30 group relative"
              >
                {/* Image panel */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-50 dark:bg-stone-900/60 border-b border-[#8E6D4E]/5">
                  <img
                    src={prod.imageUrl}
                    alt={prod.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Glassmorphism overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                  
                  {/* Category overlay label */}
                  <span className="absolute top-3 left-3 px-3 py-1 text-[9px] uppercase tracking-wider font-extrabold rounded-full bg-[#12100E]/80 text-white border border-white/10 backdrop-blur-md">
                    {translatedCategories.find((c) => c.id === prod.categoryId)?.name || getTranslation(lang, "communityCraft")}
                  </span>
                  
                  {/* Stock count label */}
                  <span className={`absolute top-3 right-3 px-3 py-1 text-[9px] font-black rounded-full border backdrop-blur-md ${
                    isOutOfStock 
                      ? "bg-red-500/10 text-red-500 border-red-500/20" 
                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  }`}>
                    {isOutOfStock ? getTranslation(lang, "preOrder") : `${getTranslation(lang, "readyToShip")} ${prod.stock.length} ${getTranslation(lang, "items")}`}
                  </span>
                </div>

                {/* Card description body */}
                <div className="flex flex-1 flex-col p-5 space-y-3">
                  {prod.sellerId && (
                    <div className="flex items-center gap-1.5 text-[11px] text-stone-500 font-medium pb-1 border-b border-[#8E6D4E]/5">
                      <span className="w-4.5 h-4.5 rounded-full bg-[#8E6D4E]/10 text-[#8E6D4E] flex items-center justify-center font-serif text-[9px] font-black">
                        {prod.sellerName ? prod.sellerName.charAt(0).toUpperCase() : "S"}
                      </span>
                      <span className="hover:underline cursor-pointer" onClick={(e) => {
                        e.stopPropagation();
                        setSelectedShop(prod.sellerId!);
                      }}>
                        ร้าน: <strong className="text-[#8E6D4E]">{prod.sellerName}</strong>
                      </span>
                    </div>
                  )}
                  <h3 className="text-[14px] font-bold text-[#4E3B2C] dark:text-[#ECE5DD] min-h-[40px] line-clamp-2 leading-snug group-hover:text-[#8E6D4E] transition-colors duration-300">
                    {prod.name}
                  </h3>
                  <p className="text-[11.5px] text-stone-550 dark:text-stone-400 line-clamp-2 leading-relaxed flex-1 font-light">
                    {prod.description}
                  </p>

                  <div className="pt-4 border-t border-[#8E6D4E]/10 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-[#8E6D4E] block uppercase font-extrabold tracking-wider font-serif">{getTranslation(lang, "contributionVal")}</span>
                      <span className="text-xl font-bold font-serif text-[#8E6D4E] tracking-tight">
                        {prod.price.toLocaleString()} <span className="text-xs font-normal text-stone-550 dark:text-stone-400">{getTranslation(lang, "baht")}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onAddToCart) onAddToCart(prod.id, 1);
                        }}
                        disabled={isOutOfStock}
                        className="p-2.5 rounded-xl bg-[#8E6D4E]/10 hover:bg-[#8E6D4E]/20 text-[#8E6D4E] transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 active:scale-95 hover:scale-[1.02]"
                        title="หยิบใส่ตะกร้า (Add to Cart)"
                      >
                        <ShoppingCart size={14} />
                      </button>

                      <button
                        onClick={() => onSelectProduct(prod)}
                        className="px-4.5 py-2.5 rounded-xl text-xs font-bold bg-[#8E6D4E] hover:bg-[#725437] text-white transition-all flex items-center gap-1 cursor-pointer shadow-md shadow-[#8E6D4E]/5 active:scale-95 hover:scale-[1.02]"
                      >
                        <span>{getTranslation(lang, "viewDetailsBtn")}</span>
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}
