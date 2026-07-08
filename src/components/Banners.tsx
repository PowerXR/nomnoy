import { useState, useEffect } from "react";
import { AppSettings } from "../types";
import { ChevronLeft, ChevronRight, Sparkles, Feather, ShieldCheck, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface BannersProps {
  settings: AppSettings;
}

export default function Banners({ settings }: BannersProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = settings.banners && settings.banners.length > 0 
    ? settings.banners 
    : ["https://images.unsplash.com/photo-1550159930-40066082a4fc?auto=format&fit=crop&w=1600&q=80"];

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <section className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8" id="homepage">
      {/* Hero Banner Carousel Display */}
      <div className="relative h-[480px] sm:h-[580px] w-full overflow-hidden rounded-3xl border border-[#8E6D4E]/10 bg-stone-900 shadow-xl">
        
        {/* Carousel slides */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 h-full w-full"
          >
            {/* Background Image with elegant overlay gradient */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-105"
              style={{ backgroundImage: `url(${slides[currentSlide]})` }}
            />
            {/* Dark Green/Amber Organic Tint Overlay to match the earthy image look of the mockup */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/50 to-stone-900/15" />
            <div className="absolute inset-0 bg-emerald-950/15 mix-blend-color-burn" />

            {/* Content inside Slide */}
            <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-16 md:max-w-3xl z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="space-y-6 text-left"
              >
                {/* Pill Badge */}
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-[#FAF5EF]">
                    Welcome to Nam Noi
                  </span>
                </div>

                {/* Elegant Serif Headline */}
                <h1 className="text-4xl sm:text-6xl font-serif text-white font-light leading-[1.12] tracking-tight">
                  ชุมชนตำบลน้ำน้อย <br className="hidden sm:inline" />
                  แหล่งรวมสินค้าชุมชน คุณภาพดี, <br />
                  <span className="italic font-normal text-[#E2C7A9]">ของดีน้ำน้อย ส่งต่อความภูมิใจสู่ทุกบ้าน.</span>
                </h1>

                {/* Subtitle */}
                <p className="text-sm sm:text-base text-stone-200/90 max-w-xl leading-relaxed font-sans font-light">
                  {settings.siteSubtitle || "Discover handcrafted goods directly from the artisans of ชุมชนตำบลน้ำน้อย. Every purchase supports sustainable community growth and preserves Thai heritage."}
                </p>

                {/* Buttons styled like the mockup */}
                <div className="pt-4 flex flex-wrap items-center gap-4">
                  <a 
                    href="#recommended-products" 
                    className="px-7 py-3.5 rounded-xl text-xs font-bold bg-[#8E6D4E] hover:bg-[#725437] text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Browse Products
                  </a>
                  <a 
                    href={settings.contactFacebook} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="px-7 py-3.5 rounded-xl text-xs font-bold border border-white/30 bg-white/5 hover:bg-white/15 text-white flex items-center gap-1.5 transition-all hover:scale-[1.02]"
                  >
                    <span>Join Community</span>
                    <span>→</span>
                  </a>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Nav Arrows (Only show if multiple of slides exist) */}
        {slides.length > 1 && (
          <>
            <button 
              onClick={handlePrev} 
              className="absolute left-6 top-1/2 -translate-y-1/2 p-2.5 rounded-full cursor-pointer bg-black/35 hover:bg-black/50 border border-white/10 text-stone-200 hover:text-white transition-all z-20"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              onClick={handleNext} 
              className="absolute right-6 top-1/2 -translate-y-1/2 p-2.5 rounded-full cursor-pointer bg-black/35 hover:bg-black/50 border border-white/10 text-stone-200 hover:text-white transition-all z-20"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {/* Slide indicators bottom-right */}
        {slides.length > 1 && (
          <div className="absolute bottom-6 right-12 flex gap-2 z-20">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  currentSlide === idx 
                    ? "w-6 bg-[#E2C7A9]" 
                    : "w-1.5 bg-white/30"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Sustainable Cultural factors bottom banner */}
      <div className="grid grid-cols-1 gap-4 mt-8 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-start gap-3.5 p-5 rounded-2xl bg-[#FCFAF7] dark:bg-[#1C1815] border border-[#8E6D4E]/10 transition-all hover:border-[#8E6D4E]/20">
          <div className="p-2.5 rounded-xl bg-[#8E6D4E]/10 text-[#8E6D4E]">
            <Feather size={18} />
          </div>
          <div>
            <span className="font-serif text-stone-400 text-[10px] block font-semibold tracking-wider">01 / LOCAL ARTISANS</span>
            <h5 className="text-xs font-bold text-[#4E3B2C] dark:text-[#E2C7A9] mt-0.5">หัตถกรรมถักทอมือ</h5>
            <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1 leading-normal">ผ้าบาติกและจักสานชั้นสูง ฝีมือประณีตด้วยอัตลักษณ์ชุมชนน้ำน้อยแท้</p>
          </div>
        </div>
        <div className="flex items-start gap-3.5 p-5 rounded-2xl bg-[#FCFAF7] dark:bg-[#1C1815] border border-[#8E6D4E]/10 transition-all hover:border-[#8E6D4E]/20">
          <div className="p-2.5 rounded-xl bg-[#8E6D4E]/10 text-[#8E6D4E]">
            <Sparkles size={18} />
          </div>
          <div>
            <span className="font-serif text-stone-400 text-[10px] block font-semibold tracking-wider">02 / NATURAL CURES</span>
            <h5 className="text-xs font-bold text-[#4E3B2C] dark:text-[#E2C7A9] mt-0.5">วิถีเกษตรอินทรีย์</h5>
            <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1 leading-normal">เพาะน้ำผึ้งป่าธรรมชาติห้าเดือน และชุดสมุนไพรอบปรุงประทิ่นโฉมสด</p>
          </div>
        </div>
        <div className="flex items-start gap-3.5 p-5 rounded-2xl bg-[#FCFAF7] dark:bg-[#1C1815] border border-[#8E6D4E]/10 transition-all hover:border-[#8E6D4E]/20">
          <div className="p-2.5 rounded-xl bg-[#8E6D4E]/10 text-[#8E6D4E]">
            <ShieldCheck size={18} />
          </div>
          <div>
            <span className="font-serif text-stone-400 text-[10px] block font-semibold tracking-wider">03 / HANDMADE TRADITION</span>
            <h5 className="text-xs font-bold text-[#4E3B2C] dark:text-[#E2C7A9] mt-0.5">สืบสานภูมิปัญญา</h5>
            <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1 leading-normal">ทุกยอดการสั่งซื้อโอนกระจายรายได้หมุนเวียนกลุ่มเกษตรกรท้องถิ่นเต็มสัดส่วน</p>
          </div>
        </div>
        <div className="flex items-start gap-3.5 p-5 rounded-2xl bg-[#FCFAF7] dark:bg-[#1C1815] border border-[#8E6D4E]/10 transition-all hover:border-[#8E6D4E]/20">
          <div className="p-2.5 rounded-xl bg-[#8E6D4E]/10 text-[#8E6D4E]">
            <HelpCircle size={18} />
          </div>
          <div>
            <span className="font-serif text-stone-400 text-[10px] block font-semibold tracking-wider">04 / ECO-SUSTAINABLE</span>
            <h5 className="text-xs font-bold text-[#4E3B2C] dark:text-[#E2C7A9] mt-0.5">ศูนย์บริการประชาสัมพันธ์</h5>
            <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1 leading-normal">ติดต่อสบถามข้อมูลท่องเที่ยว และเรียนรู้ภูมิปัญญาตำบลน้ำน้อยได้ตลอดวัน</p>
          </div>
        </div>
      </div>
    </section>
  );
}
