import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Bell,
  CheckCheck,
  Loader2,
  MessageCircle,
  PackageCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";

import {
  AnimatePresence,
  motion,
} from "motion/react";

import { Language } from "../lib/translations";
import {
  Notification,
  User,
} from "../types";

interface NotificationCenterProps {
  user: User;
  lang: Language;
  onOpenHistory: () => void;
  onOpenChat: () => void;
}

export default function NotificationCenter({
  user,
  lang,
  onOpenHistory,
  onOpenChat,
}: NotificationCenterProps) {
  const [open, setOpen] =
    useState(false);

  const [
    notifications,
    setNotifications,
  ] = useState<Notification[]>([]);

  const [loading, setLoading] =
    useState(false);

  const copy =
    lang === "zh"
      ? {
          title: "通知",
          markAll: "全部已读",
          empty: "暂无通知",
          emptyDesc:
            "订单和消息更新将显示在这里",
          newLabel: "新",
        }
      : lang === "en"
      ? {
          title: "Notifications",
          markAll: "Mark all read",
          empty: "No notifications",
          emptyDesc:
            "Order and message updates will appear here",
          newLabel: "New",
        }
      : {
          title: "การแจ้งเตือน",
          markAll: "อ่านทั้งหมด",
          empty:
            "ยังไม่มีการแจ้งเตือน",
          emptyDesc:
            "สถานะคำสั่งซื้อ พัสดุ รีวิว และข้อความใหม่จะแสดงที่นี่",
          newLabel: "ใหม่",
        };

  const authToken =
    user.authToken ||
    localStorage.getItem("authToken");

  const loadNotifications = async (
    showLoading = false
  ) => {
    if (!authToken) return;

    if (showLoading) {
      setLoading(true);
    }

    try {
      const response = await fetch(
        "/api/notifications",
        {
          headers: {
            Authorization:
              `Bearer ${authToken}`,
          },
        }
      );

      if (!response.ok) return;

      const data =
        await response.json();

      if (Array.isArray(data)) {
        setNotifications(data);
      }
    } catch {
      // ไม่แสดง Error เมื่อเน็ตหลุดชั่วคราว
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadNotifications(true);

    const interval =
      window.setInterval(
        () =>
          loadNotifications(false),
        12000
      );

    return () =>
      window.clearInterval(interval);
  }, [user.id, authToken]);

  useEffect(() => {
    if (open) {
      loadNotifications(false);
    }
  }, [open]);

  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (notification) =>
          !notification.isRead
      ).length,
    [notifications]
  );

  const markRead = async (
    notification: Notification
  ) => {
    if (
      !authToken ||
      notification.isRead
    ) {
      return;
    }

    setNotifications((current) =>
      current.map((item) =>
        item.id === notification.id
          ? {
              ...item,
              isRead: true,
            }
          : item
      )
    );

    try {
      await fetch(
        `/api/notifications/${encodeURIComponent(
          notification.id
        )}/read`,
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${authToken}`,
          },
        }
      );
    } catch {
      loadNotifications(false);
    }
  };

  const markAllRead = async () => {
    if (
      !authToken ||
      unreadCount === 0
    ) {
      return;
    }

    setNotifications((current) =>
      current.map((item) => ({
        ...item,
        isRead: true,
      }))
    );

    try {
      await fetch(
        "/api/notifications/read-all",
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${authToken}`,
          },
        }
      );
    } catch {
      loadNotifications(false);
    }
  };

  const handleNotificationClick =
    async (
      notification: Notification
    ) => {
      await markRead(notification);
      setOpen(false);

      const content =
        `${notification.title} ${notification.body}`;

      if (
        content.includes(
          "ข้อความใหม่"
        )
      ) {
        onOpenChat();
      } else if (
        content.includes(
          "คำสั่งซื้อ"
        ) ||
        content.includes("พัสดุ") ||
        content.includes("จัดส่ง") ||
        content.includes(
          "รับสินค้า"
        )
      ) {
        onOpenHistory();
      }
    };

  return (
    <div className="relative">
      {/* ปุ่มกระดิ่ง */}
      <button
        type="button"
        onClick={() =>
          setOpen(
            (current) => !current
          )
        }
        className="relative rounded-xl p-2 text-[#735A45] transition hover:bg-[#8E6D4E]/5 hover:text-[#8E6D4E] dark:text-[#C5B49E] dark:hover:text-white"
        title={copy.title}
        aria-label={copy.title}
      >
        <Bell
          size={18}
          className={
            unreadCount > 0
              ? "fill-[#8E6D4E]/15"
              : ""
          }
        />

        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full border border-white bg-red-500 px-1 text-[8px] font-black text-white shadow-sm dark:border-[#141210]"
          >
            {unreadCount > 99
              ? "99+"
              : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* กดพื้นที่ว่างเพื่อปิด */}
            <div
              className="fixed inset-0 z-40"
              onClick={() =>
                setOpen(false)
              }
            />

            {/* กล่องแจ้งเตือน */}
            <motion.div
              initial={{
                opacity: 0,
                y: 10,
                scale: 0.98,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 8,
                scale: 0.98,
              }}
              className="absolute right-0 z-50 mt-2 w-[min(92vw,24rem)] overflow-hidden rounded-3xl border border-[#8E6D4E]/20 bg-[#FAF7F2] shadow-2xl shadow-stone-950/20 dark:bg-[#1A1613]"
            >
              {/* ส่วนหัว */}
              <div className="relative overflow-hidden border-b border-[#8E6D4E]/10 bg-gradient-to-br from-[#F7EDE1] to-[#E7D4BF] px-4 py-3.5 dark:from-[#241D18] dark:to-[#171310]">
                <div className="absolute -right-6 -top-8 h-20 w-20 rounded-full bg-[#B88A5E]/15 blur-2xl" />

                <div className="relative flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-[#8E6D4E]">
                      <Sparkles
                        size={10}
                      />
                      Member center
                    </div>

                    <h3 className="mt-0.5 font-serif text-sm font-black text-[#4E3B2C] dark:text-[#F0DFCC]">
                      {copy.title}
                    </h3>
                  </div>

                  <button
                    type="button"
                    disabled={
                      unreadCount === 0
                    }
                    onClick={markAllRead}
                    className="inline-flex items-center gap-1 rounded-xl bg-white/60 px-2.5 py-1.5 text-[9px] font-black text-[#715437] transition hover:bg-white disabled:opacity-40 dark:bg-black/15 dark:text-stone-300"
                  >
                    <CheckCheck
                      size={12}
                    />
                    {copy.markAll}
                  </button>
                </div>
              </div>

              {/* รายการแจ้งเตือน */}
              <div className="max-h-[26rem] overflow-y-auto p-2">
                {loading ? (
                  <div className="flex items-center justify-center gap-2 py-10 text-[10px] text-stone-400">
                    <Loader2
                      size={15}
                      className="animate-spin text-[#8E6D4E]"
                    />
                    Loading...
                  </div>
                ) : notifications.length ===
                  0 ? (
                  <div className="px-4 py-10 text-center">
                    <Bell
                      size={26}
                      className="mx-auto mb-2 text-[#8E6D4E]/35"
                    />

                    <p className="text-[11px] font-black text-[#4E3B2C] dark:text-stone-200">
                      {copy.empty}
                    </p>

                    <p className="mx-auto mt-1 max-w-xs text-[9px] leading-relaxed text-stone-400">
                      {copy.emptyDesc}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {notifications.map(
                      (notification) => {
                        const style =
                          getNotificationStyle(
                            notification
                          );

                        return (
                          <button
                            key={
                              notification.id
                            }
                            type="button"
                            onClick={() =>
                              handleNotificationClick(
                                notification
                              )
                            }
                            className={`relative flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition hover:bg-[#8E6D4E]/5 ${
                              notification.isRead
                                ? "border-transparent opacity-70"
                                : "border-[#8E6D4E]/12 bg-white/65 shadow-sm dark:bg-white/[0.03]"
                            }`}
                          >
                            {!notification.isRead && (
                              <span className="absolute right-2.5 top-2.5 rounded-full bg-red-500 px-1.5 py-0.5 text-[7px] font-black uppercase text-white">
                                {
                                  copy.newLabel
                                }
                              </span>
                            )}

                            <span
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${style.className}`}
                            >
                              {style.icon}
                            </span>

                            <span className="min-w-0 pr-7">
                              <span className="block truncate text-[10.5px] font-black text-[#4E3B2C] dark:text-stone-200">
                                {
                                  notification.title
                                }
                              </span>

                              <span className="mt-0.5 line-clamp-2 block text-[9px] leading-relaxed text-stone-500 dark:text-stone-400">
                                {
                                  notification.body
                                }
                              </span>

                              <time className="mt-1.5 block text-[8px] font-medium text-stone-400">
                                {formatDate(
                                  notification.createdAt,
                                  lang
                                )}
                              </time>
                            </span>
                          </button>
                        );
                      }
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function getNotificationStyle(
  notification: Notification
) {
  const content =
    `${notification.title} ${notification.body}`;

  if (content.includes("ข้อความ")) {
    return {
      icon: (
        <MessageCircle size={16} />
      ),
      className:
        "bg-emerald-500/10 text-emerald-600",
    };
  }

  if (content.includes("รีวิว")) {
    return {
      icon: (
        <Star
          size={16}
          className="fill-current"
        />
      ),
      className:
        "bg-amber-500/10 text-amber-600",
    };
  }

  if (
    content.includes("พัสดุ") ||
    content.includes("จัดส่ง")
  ) {
    return {
      icon: <Truck size={16} />,
      className:
        "bg-sky-500/10 text-sky-600",
    };
  }

  if (
    content.includes("รับสินค้า") ||
    content.includes("สำเร็จ")
  ) {
    return {
      icon: (
        <PackageCheck size={16} />
      ),
      className:
        "bg-violet-500/10 text-violet-600",
    };
  }

  return {
    icon: <ShoppingBag size={16} />,
    className:
      "bg-[#8E6D4E]/10 text-[#8E6D4E]",
  };
}

function formatDate(
  date: string,
  lang: Language
) {
  const value = new Date(date);

  if (
    Number.isNaN(value.getTime())
  ) {
    return "";
  }

  return value.toLocaleString(
    lang === "zh"
      ? "zh-CN"
      : lang === "en"
      ? "en-US"
      : "th-TH",
    {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}