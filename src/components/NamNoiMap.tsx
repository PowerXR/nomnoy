import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Phone, 
  Map as MapIcon, 
  Compass, 
  Building, 
  Sparkles, 
  Trees, 
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useMap } from '@vis.gl/react-google-maps';
import { AppSettings } from '../types';
import { Language, getTranslation } from '../lib/translations';

export interface Landmark {
  id: string;
  name: string;
  type: 'admin' | 'craft' | 'temple' | 'nature' | 'market';
  lat: number;
  lng: number;
  description: string;
  phone?: string;
  imageUrl: string;
}

const defaultLandmarks: Landmark[] = [
  {
    id: "loc-municipality",
    name: "สำนักงานเทศบาลตำบลน้ำน้อย",
    type: "admin",
    lat: 7.0518,
    lng: 100.5285,
    description: "ศูนย์กลางการประสานงานราชการ บริการประชาชน และจุดรวมการสนับสนุนส่งเสริมอาชีพชุมชนและผ้าบาติก",
    phone: "074-211111",
    imageUrl: "https://images.unsplash.com/photo-1577086664693-894d8405334a?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "loc-batik",
    name: "ศูนย์เรียนรู้และกลุ่มทอผ้าบาติกน้ำน้อย",
    type: "craft",
    lat: 7.0455,
    lng: 100.5212,
    description: "แหล่งผลิตผ้าบาติกทำมือชั้นยอดประจำจังหวัดสงขลา เป็นจุดสืบทอดภูมิปัญญาและเวิร์กชอปเขียนเทียนย้อมสี",
    imageUrl: "https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "loc-palm",
    name: "กลุ่มวิสาหกิจจักสานใบลานลานไทยน้ำน้อย",
    type: "craft",
    lat: 7.0482,
    lng: 100.5245,
    description: "กลุ่มหัตถกรรมจักสานใบลานพื้นบ้าน แปรรูปเป็นหมวก กระเป๋า และของตกแต่งคุณภาพส่งออก OTOP ทะเบียนสำคัญ",
    imageUrl: "https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "loc-temple-nok",
    name: "วัดน้ำน้อยนอก (วัดประดิษฐานหลวงพ่อท่านเจ้าคุณ)",
    type: "temple",
    lat: 7.0423,
    lng: 100.5235,
    description: "ศูนย์รวมศรัทธาสำคัญ ประดิษฐานรูปหล่อพระครูประสาทสุตาคุณอันเป็นที่เคารพรัก มีสถาปัตยกรรมท้องถิ่นอันงดงาม",
    imageUrl: "https://images.unsplash.com/photo-1609137144813-91b489506692?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "loc-waterfall",
    name: "น้ำตกหัวรน (อุทยานป่าต้นน้ำน้ำน้อย)",
    type: "nature",
    lat: 7.0621,
    lng: 100.5410,
    description: "น้ำตกธรรมชาติต้นน้ำที่สมบูรณ์ โอบล้อมด้วยแนวเขาสวนป่าเขียวขจี เป็นแหล่งพักผ่อนหย่อนใจทางธรรมชาติชั้นเยี่ยม",
    imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "loc-market",
    name: "ตลาดนัดวิถีชุมชนประชารัฐน้ำน้อย",
    type: "market",
    lat: 7.0501,
    lng: 100.5268,
    description: "ตลาดจำหน่ายสินค้าเกษตรอินทรีย์ อาหารพื้นบ้าน และผลิตภัณฑ์จักสานงานมือของพี่น้องชุมชนรอบเขตเทศบาล",
    imageUrl: "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=600&q=80"
  }
];

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

// A sub-component to handle map centering programmatically when a landmark is clicked
function MapCenteringController({ selectedLandmark }: { selectedLandmark: Landmark | null }) {
  const map = useMap();
  useEffect(() => {
    if (!map || !selectedLandmark) return;
    map.panTo({ lat: selectedLandmark.lat, lng: selectedLandmark.lng });
    map.setZoom(15);
  }, [map, selectedLandmark]);

  return null;
}

export default function NamNoiMap({ settings, lang = "th" }: { settings?: AppSettings | null, lang?: Language }) {
  const landmarks = (settings?.landmarks && settings.landmarks.length > 0)
    ? settings.landmarks
    : defaultLandmarks;

  const [selectedLandmark, setSelectedLandmark] = useState<Landmark | null>(landmarks[0] || null);
  const [activeInfoWindowId, setActiveInfoWindowId] = useState<string | null>(landmarks[0]?.id || null);

  useEffect(() => {
    if (landmarks && landmarks.length > 0) {
      setSelectedLandmark(landmarks[0]);
      setActiveInfoWindowId(landmarks[0].id);
    } else {
      setSelectedLandmark(null);
      setActiveInfoWindowId(null);
    }
  }, [settings?.landmarks]);

  const [showSetupGuide, setShowSetupGuide] = useState(false);

  const getIconForType = (type: Landmark['type']) => {
    switch (type) {
      case 'admin': return <Building className="text-blue-500" size={16} />;
      case 'craft': return <Sparkles className="text-amber-500" size={16} />;
      case 'temple': return <Compass className="text-red-500" size={16} />;
      case 'nature': return <Trees className="text-emerald-500" size={16} />;
      case 'market': return <ShoppingBag className="text-purple-500" size={16} />;
      default: return <MapPin size={16} />;
    }
  };

  const getBadgeColor = (type: Landmark['type']) => {
    switch (type) {
      case 'admin': return 'bg-blue-500/10 text-blue-500 dark:bg-blue-500/20';
      case 'craft': return 'bg-amber-500/10 text-amber-500 dark:bg-amber-500/20';
      case 'temple': return 'bg-red-500/10 text-red-500 dark:bg-red-500/20';
      case 'nature': return 'bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20';
      case 'market': return 'bg-purple-500/10 text-purple-500 dark:bg-purple-500/20';
      default: return 'bg-stone-500/10 text-stone-500';
    }
  };

  const getLabelForType = (type: Landmark['type']) => {
    switch (type) {
      case 'admin': return getTranslation(lang, 'categoryAdmin');
      case 'craft': return getTranslation(lang, 'categoryCraft');
      case 'temple': return getTranslation(lang, 'categoryTemple');
      case 'nature': return getTranslation(lang, 'categoryNature');
      case 'market': return getTranslation(lang, 'categoryMarket');
      default: return getTranslation(lang, 'categoryCraft');
    }
  };

  const handleLandmarkSelect = (loc: Landmark) => {
    setSelectedLandmark(loc);
    setActiveInfoWindowId(loc.id);
  };

  return (
    <section id="namnoi-map-section" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center md:text-left space-y-3 mb-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8E6D4E]/10 border border-[#8E6D4E]/20 text-[10.5px] tracking-widest uppercase font-black text-[#8E6D4E]">
          <MapIcon size={12} className="text-[#8E6D4E]" />
          <span>{lang === 'th' ? 'ภูมิศาสตร์เชิงประวัติศาสตร์และแหล่งเรียนรู้' : 'HISTORICAL GEOGRAPHY'}</span>
        </span>
        <h2 className="text-3xl sm:text-4xl font-serif text-[#4E3B2C] dark:text-[#E2C7A9] font-bold tracking-tight">
          {getTranslation(lang, 'mapTitle')}
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 font-light max-w-2xl leading-relaxed">
          {getTranslation(lang, 'mapSub')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Side: Landmarks Directory List */}
        <div className="lg:col-span-5 flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
          {landmarks.map((loc) => {
            const isSelected = selectedLandmark?.id === loc.id;
            return (
              <button
                key={loc.id}
                onClick={() => handleLandmarkSelect(loc)}
                className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 flex gap-4 cursor-pointer relative overflow-hidden group ${
                  isSelected 
                    ? "bg-[#FAF7F2] dark:bg-[#1C1815] border-[#8E6D4E]/50 shadow-md shadow-[#8E6D4E]/5" 
                    : "bg-white dark:bg-[#151210] border-[#8E6D4E]/10 hover:border-[#8E6D4E]/25 hover:bg-[#FAF7F2]/30 dark:hover:bg-[#1C1815]/20"
                }`}
              >
                {/* Visual Accent for selected */}
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#8E6D4E]" />
                )}

                {/* Thumbnail Image */}
                <div className="w-16 h-16 rounded-xl bg-stone-100 overflow-hidden shrink-0 border border-[#8E6D4E]/10 relative">
                  <img 
                    src={loc.imageUrl} 
                    alt={loc.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/10" />
                </div>

                {/* Content details */}
                <div className="flex-grow space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 ${getBadgeColor(loc.type)}`}>
                      {getIconForType(loc.type)}
                      <span>{getLabelForType(loc.type)}</span>
                    </span>
                    {loc.phone && (
                      <span className="text-[9px] text-stone-400 dark:text-stone-500 flex items-center gap-0.5">
                        <Phone size={8} />
                        <span>{loc.phone}</span>
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-[#4E3B2C] dark:text-[#E2C7A9] truncate group-hover:text-[#8E6D4E] transition-colors">
                    {loc.name}
                  </h4>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 font-light leading-relaxed line-clamp-1">
                    {loc.description}
                  </p>
                </div>

                <div className="flex items-center text-stone-300 group-hover:text-[#8E6D4E] transition-colors self-center">
                  <ChevronRight size={16} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Side: Map Display or Setup API Splash Card */}
        <div className="lg:col-span-7 h-[500px] rounded-3xl border border-[#8E6D4E]/20 overflow-hidden bg-[#FAF7F2] dark:bg-[#151210] shadow-inner relative flex flex-col">
          
          {hasValidKey ? (
            <APIProvider apiKey={API_KEY} version="weekly">
              <Map
                defaultCenter={{ lat: 7.0518, lng: 100.5285 }}
                defaultZoom={13}
                mapId="NAMNOI_MAP_ID"
                style={{ width: '100%', height: '100%' }}
                gestureHandling="cooperative"
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              >
                {/* Centering component helper */}
                <MapCenteringController selectedLandmark={selectedLandmark} />

                {landmarks.map((loc) => {
                  const isSelected = selectedLandmark?.id === loc.id;
                  const isInfoWindowOpen = activeInfoWindowId === loc.id;
                  
                  return (
                    <React.Fragment key={loc.id}>
                      <AdvancedMarker
                        position={{ lat: loc.lat, lng: loc.lng }}
                        title={loc.name}
                        onClick={() => handleLandmarkSelect(loc)}
                      >
                        <Pin 
                          background={isSelected ? "#8E6D4E" : "#D4A373"} 
                          glyphColor="#FFF"
                          borderColor={isSelected ? "#5F452E" : "#8E6D4E"}
                        />
                      </AdvancedMarker>

                      {isInfoWindowOpen && (
                        <InfoWindow
                          position={{ lat: loc.lat, lng: loc.lng }}
                          onCloseClick={() => setActiveInfoWindowId(null)}
                        >
                          <div className="p-1 max-w-[240px] text-left text-stone-800 dark:text-stone-100 space-y-2">
                            <div className="h-20 rounded-lg overflow-hidden relative bg-stone-100">
                              <img 
                                src={loc.imageUrl} 
                                alt={loc.name} 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div className="space-y-1">
                              <span className="text-[8px] uppercase tracking-wider font-extrabold text-[#8E6D4E]">
                                {getLabelForType(loc.type)}
                              </span>
                              <h5 className="text-[11.5px] font-bold text-[#4E3B2C] dark:text-stone-200 line-clamp-1">
                                {loc.name}
                              </h5>
                              <p className="text-[10px] text-stone-500 leading-relaxed font-light line-clamp-2">
                                {loc.description}
                              </p>
                              <div className="pt-1 flex items-center justify-between gap-2">
                                <a 
                                  href={`https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[9px] text-[#8E6D4E] hover:underline font-bold flex items-center gap-0.5"
                                >
                                  <span>{getTranslation(lang, 'directionBtn')}</span>
                                  <ExternalLink size={8} />
                                </a>
                                {loc.phone && (
                                  <span className="text-[9px] text-stone-400 dark:text-stone-500 font-mono">
                                    📞 {loc.phone}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </InfoWindow>
                      )}
                    </React.Fragment>
                  );
                })}
              </Map>
            </APIProvider>
          ) : (
            // Custom Dual Fallback (Rule 1C compliant): Free Embedded Iframe Map or GCP Setup Instructions
            <div className="absolute inset-0 flex flex-col h-full w-full bg-[#FAF7F2] dark:bg-[#151210] relative">
              {showSetupGuide ? (
                // Setup Guide Mode
                <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-center items-center text-center bg-gradient-to-b from-[#FAF7F2] to-[#ECE7DD] dark:from-[#1C1815] dark:to-[#12100E] space-y-4 overflow-y-auto">
                  <div className="w-12 h-12 rounded-full bg-[#8E6D4E]/10 border border-[#8E6D4E]/20 flex items-center justify-center text-[#8E6D4E] shrink-0">
                    <Info size={22} className="animate-pulse" />
                  </div>
                  
                  <div className="max-w-md space-y-2">
                    <h3 className="text-md sm:text-lg font-bold text-[#4E3B2C] dark:text-[#E2C7A9]">
                      ขั้นตอนการตั้งค่า Google Maps API Key
                    </h3>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 font-light leading-relaxed">
                      หากท่านต้องการเปิดใช้ระบบแผนที่อัจฉริยะ (สามารถปักหมุดสีสันสวยงาม ปานไปยังพิกัดอัตโนมัติ และแสดงหน้าต่างข้อความตกแต่งสีทอง) สามารถทำได้โดยวิธีการดังนี้:
                    </p>
                  </div>

                  {/* Step checklist */}
                  <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#151210] border border-[#8E6D4E]/15 p-4 text-left space-y-2.5 shadow-sm">
                    <span className="text-[9px] font-black tracking-wider text-[#8E6D4E] uppercase block font-mono">
                      วิธีเชื่อมต่อคีย์การทำงาน:
                    </span>
                    <ul className="text-[10px] sm:text-[10.5px] space-y-1.5 pl-3.5 list-decimal text-stone-600 dark:text-stone-300 font-light leading-relaxed">
                      <li>
                        สร้าง API Key จาก Google Cloud Console หรือกด 
                        <a 
                          href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#8E6D4E] hover:underline inline-flex items-center gap-0.5 ml-1 font-bold"
                        >
                          รับคีย์ฟรี <ExternalLink size={8} />
                        </a>
                      </li>
                      <li>
                        เปิดแท็บ <strong>Settings</strong> (⚙️ ด้านบนขวาของหน้าต่างแชท AI)
                      </li>
                      <li>
                        ไปที่เมนู <strong>Secrets</strong> ของโปรเจกต์
                      </li>
                      <li>
                        เพิ่มตัวแปรใหม่ชื่อ <code>GOOGLE_MAPS_PLATFORM_KEY</code> วางรหัสคีย์ และกดบันทึก
                      </li>
                    </ul>
                  </div>

                  <div className="pt-2 flex flex-col items-center gap-2">
                    <button
                      onClick={() => setShowSetupGuide(false)}
                      className="px-4 py-2 bg-[#8E6D4E] hover:bg-[#725437] text-white text-xs font-bold rounded-xl transition-all duration-300 shadow-sm shadow-[#8E6D4E]/10"
                    >
                      🔙 ย้อนกลับไปหน้าแผนที่จริงทันที
                    </button>
                    <p className="text-[9px] text-stone-400 italic font-mono text-center">
                      * ระบบเว็ปจะตรวจจับรหัสผ่านใหม่และอัปเดตระบบอัจฉริยะทันทีหลังบันทึกค่ะ
                    </p>
                  </div>
                </div>
              ) : (
                // Live Iframe Embed Mode (Works perfectly out-of-the-box, no keys needed)
                <div className="relative w-full h-full flex flex-col">
                  {/* Floating Notification Badge */}
                  <div className="absolute top-3 left-3 right-3 z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 px-3.5 rounded-2xl bg-white/95 dark:bg-[#151210]/95 backdrop-blur-md border border-[#8E6D4E]/25 shadow-lg shadow-[#8E6D4E]/5 text-left transition-all duration-300">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                      <p className="text-[10.5px] text-stone-600 dark:text-stone-300 font-medium truncate">
                        📍 พิกัดแนะนำ: <span className="font-bold text-[#8E6D4E]">{selectedLandmark?.name}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => setShowSetupGuide(true)}
                      className="text-[9px] sm:text-[9.5px] font-extrabold bg-[#FAF7F2] dark:bg-[#1C1815] hover:bg-[#8E6D4E] hover:text-white border border-[#8E6D4E]/30 text-[#8E6D4E] px-2.5 py-1 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer shrink-0"
                    >
                      <span>⚙️ วิธีตั้งค่ากุญแจแผนที่อัจฉริยะ (API)</span>
                    </button>
                  </div>

                  {/* Free Interactive Google Maps Embed Frame */}
                  <div className="w-full h-full pt-16 sm:pt-0">
                    <iframe
                      title={selectedLandmark?.name || "แผนที่แนะนำเทศบาลตำบลน้ำน้อย"}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      src={`https://maps.google.com/maps?q=${selectedLandmark?.lat || 7.0518},${selectedLandmark?.lng || 100.5285}&z=16&t=m&hl=th&output=embed`}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="w-full h-full rounded-b-3xl"
                    ></iframe>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </section>
  );
}
