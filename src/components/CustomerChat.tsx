import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { supabase } from "../lib/supabase";

interface ChatMessage {
  id: string;
  room_id: string;
  sender_type: "user" | "admin";
  message: string;
  created_at: string;
}

export default function CustomerChat() {
  const [open, setOpen] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  // สร้าง/โหลดห้องแชตของลูกค้า
  useEffect(() => {
    if (!open) return;

    const initChat = async () => {
      let savedRoom = localStorage.getItem("namnoi_chat_room");

      // ถ้ายังไม่มีห้อง ให้สร้างห้องใหม่
      if (!savedRoom) {
        const { data, error } = await supabase
          .from("chat_rooms")
          .insert({
            user_name: "ผู้เยี่ยมชม",
          })
          .select()
          .single();

        if (error) {
          console.error("สร้างห้องแชตไม่สำเร็จ:", error);
          return;
        }

        savedRoom = data.id;

        localStorage.setItem(
          "namnoi_chat_room",
          data.id
        );
      }

      setRoomId(savedRoom);

      // โหลดข้อความเก่า
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("room_id", savedRoom)
        .order("created_at", {
          ascending: true,
        });

      if (error) {
        console.error("โหลดข้อความไม่สำเร็จ:", error);
        return;
      }

      setMessages(data || []);
    };

    initChat();
  }, [open]);

  // Realtime
  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel(`customer-chat-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const newMessage =
            payload.new as ChatMessage;

          setMessages((current) => {
            const exists = current.some(
              (item) => item.id === newMessage.id
            );

            if (exists) return current;

            return [...current, newMessage];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  // เลื่อนลงข้อความล่าสุด
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // ส่งข้อความ
  const sendMessage = async () => {
    if (!message.trim() || !roomId || sending) {
      return;
    }

    const text = message.trim();

    setMessage("");
    setSending(true);

    const { error } = await supabase
      .from("chat_messages")
      .insert({
        room_id: roomId,
        sender_type: "user",
        message: text,
      });

    if (error) {
      console.error("ส่งข้อความไม่สำเร็จ:", error);
      setMessage(text);
    }

    setSending(false);
  };

  return (
    <>
      {/* ปุ่มติดต่อแอดมิน */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="
            fixed
            bottom-5
            right-5
            z-[9999]
            flex
            items-center
            gap-2
            rounded-full
            bg-[#8E6D4E]
            px-5
            py-3.5
            text-sm
            font-bold
            text-white
            shadow-2xl
            transition-all
            hover:bg-[#725437]
            hover:scale-105
          "
        >
          <MessageCircle size={20} />

          <span className="hidden sm:inline">
            ติดต่อแอดมิน
          </span>
        </button>
      )}

      {/* หน้าต่าง Chat */}
      {open && (
        <div
          className="
            fixed
            bottom-4
            right-4
            z-[9999]
            flex
            h-[560px]
            max-h-[80vh]
            w-[380px]
            max-w-[calc(100vw-32px)]
            flex-col
            overflow-hidden
            rounded-3xl
            border
            border-[#8E6D4E]/30
            bg-[#15110E]
            shadow-2xl
          "
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-[#8E6D4E] px-5 py-4 text-white">
            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
                <MessageCircle size={20} />
              </div>

              <div>
                <div className="text-sm font-bold">
                  ติดต่อแอดมิน
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-white/80">
                  <span className="h-2 w-2 rounded-full bg-green-400" />

                  สอบถามปัญหาได้ที่นี่
                </div>
              </div>

            </div>

            <button
              onClick={() => setOpen(false)}
              className="rounded-full p-2 transition hover:bg-white/10"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">

            {messages.length === 0 && (
              <div className="mt-8 text-center">

                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#8E6D4E]/15 text-[#E2C7A9]">
                  <MessageCircle size={23} />
                </div>

                <p className="text-sm font-semibold text-stone-200">
                  ยินดีต้อนรับ 👋
                </p>

                <p className="mt-1 text-xs text-stone-500">
                  มีปัญหาหรือข้อสงสัย
                  <br />
                  สามารถสอบถามแอดมินได้เลยครับ
                </p>

              </div>
            )}

            <div className="space-y-3">

              {messages.map((msg) => {

                const isUser =
                  msg.sender_type === "user";

                return (
                  <div
                    key={msg.id}
                    className={`flex ${
                      isUser
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`
                        max-w-[80%]
                        rounded-2xl
                        px-4
                        py-2.5
                        text-sm
                        leading-relaxed
                        ${
                          isUser
                            ? "rounded-br-md bg-[#8E6D4E] text-white"
                            : "rounded-bl-md bg-stone-800 text-stone-100"
                        }
                      `}
                    >
                      <div>{msg.message}</div>

                      <div
                        className={`mt-1 text-[9px] ${
                          isUser
                            ? "text-white/60"
                            : "text-stone-500"
                        }`}
                      >
                        {new Date(
                          msg.created_at
                        ).toLocaleTimeString(
                          "th-TH",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}

              <div ref={bottomRef} />

            </div>
          </div>

          {/* ช่องส่งข้อความ */}
          <div className="border-t border-white/10 bg-[#1C1815] p-3">

            <div className="flex items-center gap-2">

              <input
                type="text"
                value={message}
                onChange={(e) =>
                  setMessage(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
                placeholder="พิมพ์ข้อความ..."
                className="
                  min-w-0
                  flex-1
                  rounded-xl
                  border
                  border-white/10
                  bg-stone-900
                  px-4
                  py-3
                  text-sm
                  text-white
                  outline-none
                  transition
                  placeholder:text-stone-600
                  focus:border-[#8E6D4E]
                "
              />

              <button
                onClick={sendMessage}
                disabled={
                  !message.trim() || sending
                }
                className="
                  flex
                  h-11
                  w-11
                  flex-shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#8E6D4E]
                  text-white
                  transition
                  hover:bg-[#725437]
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                <Send size={18} />
              </button>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
