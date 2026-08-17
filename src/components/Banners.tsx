import { useState, useEffect } from "react";
import { AppSettings } from "../types";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Feather,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface BannersProps {
  settings: AppSettings;
}

export default function Banners({ settings }: BannersProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides =
    settings.banners && settings.banners.length > 0
      ? settings.banners
      : [
          "https://images.unsplash.com/photo-1550159930-40066082a4fc?auto=format&fit=crop&w=1600&q=80",
        ];

  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const handlePrev = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + slides.length) % slides.length
    );
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <section
      className="relative mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8"
      id="homepage"
    >
      {/* =====================================================
          HERO BANNER
      ====================================================== */}
      <div
        className="
          relative
          h-[560px]
          sm:h-[580px]
          lg:h-[580px]
          w-full
          overflow-hidden
          rounded-[28px]
          border
          border-[#8E6D4E]/10
          bg-stone-900
          shadow-xl
        "
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 h-full w-full"
          >
            {/* =================================================
                BACKGROUND IMAGE

                มือถือ:
                - ไม่ใช้ scale-105 เพื่อไม่ให้ภาพถูกซูมมากเกินไป
                - ขยับภาพไปทางขวาเพื่อให้อาคารเข้ามาในจอ

                Desktop:
                - กลับมา center ตามเดิม
                - ซูมนิดหน่อยเหมือนดีไซน์เดิม
            ================================================== */}
            <div
              className="
                absolute
                inset-0
                bg-cover
                bg-[position:72%_center]
                sm:bg-center
                scale-100
                sm:scale-105
                transition-all
                duration-1000
              "
              style={{
                backgroundImage: `url(${slides[currentSlide]})`,
              }}
            />

            {/* =================================================
                MOBILE OVERLAY

                ไล่ดำจากล่างขึ้นบน
                ช่วยให้ข้อความอ่านง่าย แต่ยังมองเห็นรูป
            ================================================== */}
            <div
              className="
                absolute
                inset-0
                bg-[linear-gradient(to_top,rgba(12,7,4,0.96)_0%,rgba(12,7,4,0.78)_34%,rgba(12,7,4,0.18)_72%,rgba(12,7,4,0.02)_100%)]
                sm:bg-gradient-to-t
                sm:from-stone-950/85
                sm:via-stone-950/50
                sm:to-stone-900/15
              "
            />

            {/* Mobile left-side shading to keep text readable while showing the building */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(10,6,4,0.72)_0%,rgba(10,6,4,0.28)_42%,rgba(10,6,4,0)_72%)] sm:hidden" />

            {/* Earthy / Green tint */}
            <div className="absolute inset-0 bg-emerald-950/10 mix-blend-color-burn" />

            {/* =================================================
                CONTENT
            ================================================== */}
            <div
              className="
                absolute
                inset-0
                z-10
                flex
                flex-col
                justify-end
                px-6
                pb-10

                sm:justify-center
                sm:px-16
                sm:pb-0

                md:max-w-3xl
              "
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.2,
                  duration: 0.8,
                }}
                className="space-y-4 sm:space-y-6 text-left"
              >
                {/* Badge */}
                <div>
                  <span
                    className="
                      inline-flex
                      items-center
                      gap-1.5
                      px-3.5
                      py-1.5
                      rounded-full
                      border
                      border-white/20
                      bg-black/20
                      backdrop-blur-md
                      text-[10px]
                      sm:text-xs
                      font-semibold
                      uppercase
                      tracking-wider
                      text-[#FAF5EF]
                    "
                  >
                    Welcome to Nam Noi
                  </span>
                </div>

                {/* =================================================
                    HEADLINE
                ================================================== */}
                <h1
                  className="
                    text-[33px]
                    sm:text-5xl
                    md:text-6xl
                    font-serif
                    text-white
                    font-light
                    leading-[1.06]
                    sm:leading-[1.12]
                    tracking-tight
                    drop-shadow-lg
                  "
                >
                  ชุมชนตำบลน้ำน้อย
                  <br />

                  แหล่งรวมสินค้าชุมชน
                  <br />

                  คุณภาพดี,
                  <br />

                  <span className="italic font-normal text-[#E2C7A9]">
                    ของดีน้ำน้อย ส่งต่อความภูมิใจสู่ทุกบ้าน.
                  </span>
                </h1>

                {/* Subtitle */}
                <p
                  className="
                    text-[12px]
                    sm:text-base
                    text-stone-200/90
                    max-w-xl
                    leading-relaxed
                    font-sans
                    font-light
                    drop-shadow-md
                  "
                >
                  {settings.siteSubtitle ||
                    "Discover handcrafted goods directly from the artisans of ชุมชนตำบลน้ำน้อย. Every purchase supports sustainable community growth and preserves Thai heritage."}
                </p>

                {/* =================================================
                    BUTTONS
                ================================================== */}
                <div className="pt-2 sm:pt-4 flex flex-wrap items-center gap-3 sm:gap-4">
                  <a
                    href="#recommended-products"
                    className="
                      px-6
                      sm:px-7
                      py-3.5
                      rounded-xl
                      text-xs
                      font-bold
                      bg-[#A17B54]
                      hover:bg-[#725437]
                      text-white
                      shadow-lg
                      transition-all
                      hover:scale-[1.02]
                      active:scale-[0.98]
                    "
                  >
                    Browse Products
                  </a>

                  <a
                    href={settings.contactFacebook}
                    target="_blank"
                    rel="noreferrer"
                    className="
                      px-6
                      sm:px-7
                      py-3.5
                      rounded-xl
                      text-xs
                      font-bold
                      border
                      border-white/30
                      bg-black/15
                      backdrop-blur-sm
                      hover:bg-white/15
                      text-white
                      flex
                      items-center
                      gap-1.5
                      transition-all
                      hover:scale-[1.02]
                    "
                  >
                    <span>Join Community</span>
                    <span>→</span>
                  </a>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* =====================================================
            CAROUSEL ARROWS
        ====================================================== */}
        {slides.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              aria-label="Previous slide"
              className="
                absolute
                left-3
                sm:left-6
                top-1/2
                -translate-y-1/2
                p-2.5
                rounded-full
                cursor-pointer
                bg-black/35
                hover:bg-black/50
                border
                border-white/10
                text-stone-200
                hover:text-white
                backdrop-blur-sm
                transition-all
                z-20
              "
            >
              <ChevronLeft size={18} />
            </button>

            <button
              onClick={handleNext}
              aria-label="Next slide"
              className="
                absolute
                right-3
                sm:right-6
                top-1/2
                -translate-y-1/2
                p-2.5
                rounded-full
                cursor-pointer
                bg-black/35
                hover:bg-black/50
                border
                border-white/10
                text-stone-200
                hover:text-white
                backdrop-blur-sm
                transition-all
                z-20
              "
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {/* =====================================================
            SLIDE INDICATORS
        ====================================================== */}
        {slides.length > 1 && (
          <div
            className="
              absolute
              bottom-5
              right-6
              sm:bottom-6
              sm:right-12
              flex
              gap-2
              z-20
            "
          >
            {slides.map((_, idx) => (
              <button
                key={idx}
                aria-label={`Go to slide ${idx + 1}`}
                onClick={() => setCurrentSlide(idx)}
                className={`
                  h-1.5
                  rounded-full
                  transition-all
                  cursor-pointer
                  ${
                    currentSlide === idx
                      ? "w-6 bg-[#E2C7A9]"
                      : "w-1.5 bg-white/30"
                  }
                `}
              />
            ))}
          </div>
        )}
      </div>

      {/* =====================================================
          FEATURES
      ====================================================== */}
      <div className="grid grid-cols-1 gap-4 mt-8 sm:grid-cols-2 lg:grid-cols-4">
        {/* LOCAL PRODUCTS */}
        <div className="flex items-start gap-3.5 p-5 rounded-2xl bg-[#FCFAF7] dark:bg-[#1C1815] border border-[#8E6D4E]/10 transition-all hover:border-[#8E6D4E]/20">
          <div className="p-2.5 rounded-xl bg-[#8E6D4E]/10 text-[#8E6D4E]">
            <Feather size={18} />
          </div>

          <div>
            <span className="font-serif text-stone-400 text-[10px] block font-semibold tracking-wider">
              01 / LOCAL PRODUCTS
            </span>

            <h5 className="text-xs font-bold text-[#4E3B2C] dark:text-[#E2C7A9] mt-0.5">
              สินค้าชุมชนคัดสรร
            </h5>

            <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1 leading-normal">
              รวมผลิตภัณฑ์คุณภาพจากคนในตำบลน้ำน้อย
              โดดเด่นด้วยเอกลักษณ์และความตั้งใจในทุกชิ้น
            </p>
          </div>
        </div>

        {/* NATURAL GOODNESS */}
        <div className="flex items-start gap-3.5 p-5 rounded-2xl bg-[#FCFAF7] dark:bg-[#1C1815] border border-[#8E6D4E]/10 transition-all hover:border-[#8E6D4E]/20">
          <div className="p-2.5 rounded-xl bg-[#8E6D4E]/10 text-[#8E6D4E]">
            <Sparkles size={18} />
          </div>

          <div>
            <span className="font-serif text-stone-400 text-[10px] block font-semibold tracking-wider">
              02 / NATURAL GOODNESS
            </span>

            <h5 className="text-xs font-bold text-[#4E3B2C] dark:text-[#E2C7A9] mt-0.5">
              คุณค่าจากธรรมชาติ
            </h5>

            <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1 leading-normal">
              คัดสรรวัตถุดิบท้องถิ่นอย่างพิถีพิถัน
              เพื่อส่งมอบผลิตภัณฑ์ที่ดีและน่าใช้ในทุกวัน
            </p>
          </div>
        </div>

        {/* LOCAL WISDOM */}
        <div className="flex items-start gap-3.5 p-5 rounded-2xl bg-[#FCFAF7] dark:bg-[#1C1815] border border-[#8E6D4E]/10 transition-all hover:border-[#8E6D4E]/20">
          <div className="p-2.5 rounded-xl bg-[#8E6D4E]/10 text-[#8E6D4E]">
            <ShieldCheck size={18} />
          </div>

          <div>
            <span className="font-serif text-stone-400 text-[10px] block font-semibold tracking-wider">
              03 / LOCAL WISDOM
            </span>

            <h5 className="text-xs font-bold text-[#4E3B2C] dark:text-[#E2C7A9] mt-0.5">
              สืบสานภูมิปัญญา
            </h5>

            <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1 leading-normal">
              ถ่ายทอดเรื่องราวและฝีมือจากรุ่นสู่รุ่น
              รักษาเสน่ห์ภูมิปัญญาท้องถิ่นให้คงอยู่
            </p>
          </div>
        </div>

        {/* FRIENDLY SERVICE */}
        <div className="flex items-start gap-3.5 p-5 rounded-2xl bg-[#FCFAF7] dark:bg-[#1C1815] border border-[#8E6D4E]/10 transition-all hover:border-[#8E6D4E]/20">
          <div className="p-2.5 rounded-xl bg-[#8E6D4E]/10 text-[#8E6D4E]">
            <HelpCircle size={18} />
          </div>

          <div>
            <span className="font-serif text-stone-400 text-[10px] block font-semibold tracking-wider">
              04 / FRIENDLY SERVICE
            </span>

            <h5 className="text-xs font-bold text-[#4E3B2C] dark:text-[#E2C7A9] mt-0.5">
              บริการด้วยความใส่ใจ
            </h5>

            <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1 leading-normal">
              สอบถามข้อมูลสินค้าและการสั่งซื้อได้อย่างสะดวก
              พร้อมให้คำแนะนำในทุกขั้นตอน
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
