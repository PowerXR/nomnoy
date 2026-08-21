import { useEffect, useRef, useState } from "react";
import { Volume2, Pause, Play, Square, X } from "lucide-react";

type ReaderStatus = "idle" | "speaking" | "paused";

function splitText(text: string, maxLength = 180) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  const chunks: string[] = [];

  let position = 0;

  while (position < cleaned.length) {
    let end = Math.min(position + maxLength, cleaned.length);

    if (end < cleaned.length) {
      const spacePosition = cleaned.lastIndexOf(" ", end);

      if (spacePosition > position + 80) {
        end = spacePosition;
      }
    }

    const chunk = cleaned.slice(position, end).trim();

    if (chunk) {
      chunks.push(chunk);
    }

    position = end;
  }

  return chunks;
}

export default function TextReader() {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<ReaderStatus>("idle");
  const [rate, setRate] = useState(0.6);

  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const chunksRef = useRef<string[]>([]);
  const currentIndexRef = useRef(0);
  const readerIdRef = useRef(0);
  const rateRef = useRef(rate);

  const isSupported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => {
    rateRef.current = rate;
  }, [rate]);

  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

    return () => {
      readerIdRef.current += 1;
      window.speechSynthesis.cancel();
      window.speechSynthesis.removeEventListener(
        "voiceschanged",
        loadVoices
      );
    };
  }, [isSupported]);

  const speakNextChunk = (readerId: number) => {
    if (readerId !== readerIdRef.current) return;

    const currentText = chunksRef.current[currentIndexRef.current];

    if (!currentText) {
      setStatus("idle");
      return;
    }

    const speech = new SpeechSynthesisUtterance(currentText);

    const thaiVoice = voicesRef.current.find((voice) =>
      voice.lang.toLowerCase().startsWith("th")
    );

    if (thaiVoice) {
      speech.voice = thaiVoice;
      speech.lang = thaiVoice.lang;
    } else {
      speech.lang = "th-TH";
    }

    speech.rate = rateRef.current;
    speech.pitch = 1;
    speech.volume = 1;

    speech.onend = () => {
      if (readerId !== readerIdRef.current) return;

      currentIndexRef.current += 1;
      speakNextChunk(readerId);
    };

    speech.onerror = (event) => {
      if (event.error === "canceled" || event.error === "interrupted") {
        return;
      }

      setStatus("idle");
    };

    window.speechSynthesis.speak(speech);
  };

  const startReading = () => {
    if (!isSupported) {
      alert("เบราว์เซอร์นี้ไม่รองรับระบบอ่านออกเสียง");
      return;
    }

    // ถ้าผู้ใช้ลากเลือกข้อความ จะอ่านข้อความที่เลือกก่อน
    const selectedText = window.getSelection()?.toString().trim() || "";

    // ถ้าไม่ได้เลือกข้อความ จะอ่านเนื้อหาใน main
    const readerArea =
      document.querySelector<HTMLElement>("[data-reader-content]") ||
      document.querySelector<HTMLElement>("main");

    const pageText =
      readerArea?.innerText.replace(/\s+/g, " ").trim() || "";

    const textToRead = selectedText || pageText;

    if (!textToRead) {
      alert("ไม่พบข้อความสำหรับอ่าน");
      return;
    }

    readerIdRef.current += 1;
    const newReaderId = readerIdRef.current;

    window.speechSynthesis.cancel();

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    chunksRef.current = splitText(textToRead);
    currentIndexRef.current = 0;
    setStatus("speaking");

    window.setTimeout(() => {
      speakNextChunk(newReaderId);
    }, 100);
  };

  const pauseReading = () => {
    window.speechSynthesis.pause();
    setStatus("paused");
  };

  const resumeReading = () => {
    window.speechSynthesis.resume();
    setStatus("speaking");
  };

  const stopReading = () => {
    readerIdRef.current += 1;
    window.speechSynthesis.cancel();

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    setStatus("idle");
  };

  const closeReader = () => {
    stopReading();
    setIsOpen(false);
  };

  return (
    <div
      data-speech-ignore="true"
      className="fixed bottom-5 left-5 z-[9999]"
    >
      {isOpen ? (
        <div className="w-[330px] max-w-[calc(100vw-32px)] rounded-2xl border border-amber-200/20 bg-[#17110d] p-4 text-white shadow-2xl">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-amber-300" />
              <span className="font-semibold">ช่วยอ่านออกเสียง</span>
            </div>

            <button
              onClick={closeReader}
              className="rounded-lg p-2 hover:bg-white/10"
              aria-label="ปิดระบบอ่านออกเสียง"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="mb-4 text-sm text-white/70">
            ลากเลือกข้อความที่ต้องการ หรือกดอ่านเนื้อหาทั้งหน้า
          </p>

          {status === "idle" && (
            <button
              onClick={startReading}
              disabled={!isSupported}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-700 px-4 py-3 font-semibold hover:bg-amber-600 disabled:opacity-50"
            >
              <Play className="h-5 w-5" />
              เริ่มอ่านหน้านี้
            </button>
          )}

          {status !== "idle" && (
            <div className="grid grid-cols-2 gap-2">
              {status === "speaking" ? (
                <button
                  onClick={pauseReading}
                  className="flex items-center justify-center gap-2 rounded-xl bg-amber-700 px-4 py-3 font-semibold"
                >
                  <Pause className="h-5 w-5" />
                  พัก
                </button>
              ) : (
                <button
                  onClick={resumeReading}
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 font-semibold"
                >
                  <Play className="h-5 w-5" />
                  อ่านต่อ
                </button>
              )}

              <button
                onClick={stopReading}
                className="flex items-center justify-center gap-2 rounded-xl bg-red-800 px-4 py-3 font-semibold"
              >
                <Square className="h-5 w-5" />
                หยุด
              </button>
            </div>
          )}

          <div className="mt-4">
            <div className="mb-2 flex justify-between text-sm">
              <label htmlFor="speech-rate">ความเร็วเสียง</label>
              <span>{rate.toFixed(1)} เท่า</span>
            </div>

            <input
              id="speech-rate"
              type="range"
              min="0.4"
              max="1.2"
              step="0.1"
              value={rate}
              onChange={(event) => setRate(Number(event.target.value))}
              className="w-full accent-amber-600"
            />
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex min-h-12 items-center gap-2 rounded-full border border-amber-200/20 bg-[#17110d] px-5 py-3 font-semibold text-white shadow-xl hover:bg-[#2a1e16]"
          aria-label="เปิดระบบอ่านออกเสียง"
        >
          <Volume2 className="h-5 w-5 text-amber-300" />
          อ่านออกเสียง
        </button>
      )}
    </div>
  );
}
